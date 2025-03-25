const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";

export async function generateSummary({
  activityLog,
  summaryLength,
  workingHours,
  additionalInstructions = "",
}: {
  activityLog: string;
  summaryLength: number;
  workingHours: string;
  additionalInstructions?: string;
}) {
  try {
    const [startTime] = workingHours.split(" - ");
    const earlyTime = new Date(`2000-01-01 ${startTime}`);
    earlyTime.setMinutes(earlyTime.getMinutes() - 15);
    const earlyTimeStr = earlyTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const prompt = `Please generate a professional ${summaryLength}-word summary of my internship activities. Format it as a proper paragraph. Start by mentioning that I arrived at ${earlyTimeStr} and left 15 minutes after my scheduled end time. ${additionalInstructions}\n\nActivities:\n${activityLog}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: summaryLength * 2,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating summary:", error);
    // Create a simple fallback summary
    const [startTime] = workingHours.split(" - ");
    return `I arrived at ${startTime} and worked on ${activityLog.substring(0, 100)}... and other tasks throughout the day.`;
  }
}

export async function regenerateSummary({
  activityLog,
  summaryLength,
  workingHours,
  additionalInstructions,
}: {
  activityLog: string;
  summaryLength: number;
  workingHours: string;
  additionalInstructions: string;
}) {
  return generateSummary({
    activityLog,
    summaryLength,
    workingHours,
    additionalInstructions,
  });
}
