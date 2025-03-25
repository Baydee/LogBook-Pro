import OpenAI from "openai";
import { supabase } from "./supabase";

// Use environment variable for GitHub token
const token = import.meta.env.VITE_GITHUB_TOKEN || "";

// Helper function to determine work mode for today
async function getWorkModeForToday() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "onsite";

    const { data } = await supabase
      .from("user_profiles")
      .select("work_mode, working_days")
      .eq("id", user.id)
      .single();

    if (!data) return "onsite";

    if (data.work_mode === "remote") return "remote";
    if (data.work_mode === "onsite") return "onsite";

    // For hybrid mode, check if today is a WFH day
    if (data.work_mode === "hybrid" && data.working_days) {
      const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayMap = {
        1: "monday",
        2: "tuesday",
        3: "wednesday",
        4: "thursday",
        5: "friday",
      };

      // If today is a weekday and marked as an office day in working_days
      if (today >= 1 && today <= 5 && data.working_days[dayMap[today]]) {
        return "onsite";
      } else {
        return "remote";
      }
    }

    return "onsite"; // Default fallback
  } catch (error) {
    console.error("Error determining work mode:", error);
    return "onsite"; // Default fallback on error
  }
}

import { generateFallbackSummary } from "./api-fallback";

export async function generateAISummary({
  activityLog,
  summaryLength,
  workingHours,
  companyName = "the company",
  extractedFileText = "",
}) {
  try {
    const [startTime, endTime] = workingHours.split(" - ");

    // Compute a slightly earlier arrival time
    const earlyTime = new Date(`2000-01-01 ${startTime}`);
    earlyTime.setMinutes(
      earlyTime.getMinutes() - Math.floor(Math.random() * 15),
    );
    const earlyTimeStr = earlyTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Compute a slightly later leaving time
    const lateTime = new Date(`2000-01-01 ${endTime}`);
    lateTime.setMinutes(lateTime.getMinutes() + Math.floor(Math.random() * 15));
    const lateTimeStr = lateTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Format the AI prompt based on work mode
    let prompt;
    const workMode = await getWorkModeForToday();

    if (workMode === "remote") {
      prompt = `Without any heading Give me a summary for today as an intern at ${companyName}. I started working by ${earlyTimeStr} from home doing ( ${activityLog}). This is a file i worked with ${extractedFileText}. Make sure the suammry is a ${summaryLength}-word summary. I stopped working by ${lateTimeStr}`;
    } else {
      prompt = `Without any heading Give me a summary for today as an intern at ${companyName}. I arrived at ${earlyTimeStr} then i  (${activityLog}). This is a file i worked with  ${extractedFileText}. Make sure the suammry is a ${summaryLength}-word summary. I left at ${lateTimeStr}`;
    }

    // Create the client using your GitHub token and the provided endpoint
    const client = new OpenAI({
      baseURL: "https://models.inference.ai.azure.com",
      apiKey: token,
      dangerouslyAllowBrowser: true,
    });

    // Call the API using the proper method
    const response = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a professional summary writer for internship activity logs you'll try as much as possible to discribe the things did for a day in a summary and if user has a file of what they did, you should try to talk more about the file .",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: summaryLength * 2, // Adjust as needed
      top_p: 1,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating summary:", error);
    // Use fallback summary generation when API fails
    return generateFallbackSummary({
      activityLog,
      summaryLength,
      workingHours,
      companyName,
      extractedFileText,
    });
  }
}
