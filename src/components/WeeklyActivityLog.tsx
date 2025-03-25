import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { generateAISummary } from "@/lib/github-ai";
import { extractTextFromFile } from "@/lib/file-processing";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Upload, FileText, Image as ImageIcon, X, Eye } from "lucide-react";
import SummaryPreview from "./SummaryPreview";
import { validateFile } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, addDays, startOfWeek } from "date-fns";

interface WeeklyActivityLogProps {
  userId: string;
}

const WeeklyActivityLog = ({ userId }: WeeklyActivityLogProps) => {
  const [selectedDay, setSelectedDay] = useState("MON");
  const [media, setMedia] = useState<File[]>([]);
  const [summaryLength, setSummaryLength] = useState("100");
  const [logs, setLogs] = useState<
    Record<string, { log: string; summary: string; summary_length: number }>
  >({});
  const [activityByDay, setActivityByDay] = useState<Record<string, string>>(
    {},
  );
  const [activity, setActivity] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number | string;
  }>({});

  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 5 }, (_, i) => addDays(monday, i));

  // Save weekly activity state to localStorage with expiration
  useEffect(() => {
    if (userId) {
      loadWeeklyLogs();

      // Load any saved drafts from localStorage
      const savedDraftsItem = localStorage.getItem("weeklyActivityDrafts");
      if (savedDraftsItem) {
        try {
          const savedData = JSON.parse(savedDraftsItem);
          // Check if data is expired (older than 20 minutes)
          if (
            savedData.timestamp &&
            Date.now() - savedData.timestamp < 20 * 60 * 1000
          ) {
            setActivityByDay(savedData.drafts);
          } else {
            // Clear expired data
            localStorage.removeItem("weeklyActivityDrafts");
          }
        } catch (e) {
          console.error("Error parsing saved drafts", e);
        }
      }
    }
  }, [userId]);

  const loadWeeklyLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", format(weekDates[0], "yyyy-MM-dd"))
        .lte("date", format(weekDates[4], "yyyy-MM-dd"));

      if (error) throw error;

      const logsByDate = {};
      data?.forEach((log) => {
        logsByDate[log.date] = {
          log: log.log || "",
          summary: log.summary || "",
          summary_length: log.summary_length || 100,
        };
      });
      setLogs(logsByDate);

      // Set initial activity if available for selected day
      const selectedDate = format(weekDates[0], "yyyy-MM-dd");
      if (logsByDate[selectedDate]) {
        setActivity(logsByDate[selectedDate].log);
      }
    } catch (error) {
      console.error("Error loading logs:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      try {
        files.forEach(validateFile);
        setMedia(files);

        files.forEach((file) => {
          if (file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setUploadProgress((prev) => ({
              ...prev,
              [`preview_${file.name}`]: url,
            }));
          }
        });
      } catch (error) {
        setSubmitError(error.message);
      }
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setMedia((prev) => prev.filter((file) => file.name !== fileName));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      delete newProgress[`preview_${fileName}`];
      return newProgress;
    });
  };

  const handlePreviewFile = async (file: File) => {
    try {
      if (file.type.startsWith("image/")) {
        setPreviewUrl(
          uploadProgress[`preview_${file.name}`] || URL.createObjectURL(file),
        );
        setPreviewType("image");
      } else {
        const text = await extractTextFromFile(file);
        setPreviewUrl(text);
        setPreviewType("text");
      }
    } catch (error) {
      console.error("Error previewing file:", error);
      setSubmitError("Error previewing file: " + error.message);
    }
  };

  const [generatedSummary, setGeneratedSummary] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim()) {
      setSubmitError("Please enter your activities");
      return;
    }

    e.preventDefault();
    setIsGenerating(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const selectedIndex = ["MON", "TUE", "WED", "THU", "FRI"].indexOf(
        selectedDay,
      );
      const selectedDate = format(weekDates[selectedIndex], "yyyy-MM-dd");

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("working_hours, company_name")
        .eq("id", user.id)
        .single();

      // Extract text from uploaded files if any
      let extractedText = "";
      if (media.length > 0) {
        try {
          for (const file of media) {
            if (!file.type.startsWith("image/")) {
              const text = await extractTextFromFile(file);

              // Only limit to 40,000 characters if needed
              const fileContent =
                text.length > 40000 ? text.substring(0, 40000) : text;

              extractedText += `\n\nFile: ${file.name}\n${fileContent}`;
            }
          }
        } catch (error) {
          console.error("Error extracting text from files:", error);
        }
      }

      console.log("Generating summary...");
      const summary = await generateAISummary({
        activityLog: activity,
        summaryLength: parseInt(summaryLength),
        workingHours: profile?.working_hours || "9:00 AM - 5:00 PM",
        companyName: profile?.company_name,
        extractedFileText: extractedText,
      });

      setGeneratedSummary(summary);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSubmitError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDaySelect = (day: string) => {
    // Save current activity to state before switching
    if (selectedDay) {
      const updatedDrafts = {
        ...activityByDay,
        [selectedDay]: activity,
      };
      setActivityByDay(updatedDrafts);

      // Save to localStorage with timestamp
      localStorage.setItem(
        "weeklyActivityDrafts",
        JSON.stringify({
          drafts: updatedDrafts,
          timestamp: Date.now(),
        }),
      );
    }

    setSelectedDay(day);
    const selectedIndex = ["MON", "TUE", "WED", "THU", "FRI"].indexOf(day);
    const selectedDate = format(weekDates[selectedIndex], "yyyy-MM-dd");
    const existingLog = logs[selectedDate];

    // Check if we have unsaved content for this day
    if (activityByDay[day]) {
      setActivity(activityByDay[day]);
    } else if (existingLog) {
      setActivity(existingLog.log || "");
      setSummaryLength(existingLog.summary_length?.toString() || "100");
    } else {
      setActivity("");
      setSummaryLength("100");
    }
  };

  return (
    <Card className="w-full p-4 md:p-6 shadow-lg">
      <div className="text-2xl font-bold mb-6">
        Week of {format(weekDates[0], "MMM d")} -{" "}
        {format(weekDates[4], "MMM d, yyyy")}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4 mb-8">
        {["MON", "TUE", "WED", "THU", "FRI"].map((day, index) => (
          <div
            key={day}
            className={`border-2 ${selectedDay === day ? "border-primary" : "border-gray-200"} p-4 rounded-lg cursor-pointer hover:border-primary transition-colors ${logs[format(weekDates[index], "yyyy-MM-dd")]?.summary ? "bg-primary text-primary-foreground hover:bg-primary" : "bg-card text-card-foreground"}`}
            onClick={() => handleDaySelect(day)}
          >
            <div className="text-xl font-bold text-center border-b-4 border-muted pb-2 mb-2">
              {day}
            </div>
            <div className="text-sm text-center">
              {format(weekDates[index], "MMM d")}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {logs[
          format(
            weekDates[["MON", "TUE", "WED", "THU", "FRI"].indexOf(selectedDay)],
            "yyyy-MM-dd",
          )
        ]?.summary && (
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="font-medium mb-2">Previous Summary</h3>
            <p className="text-muted-foreground">
              {
                logs[
                  format(
                    weekDates[
                      ["MON", "TUE", "WED", "THU", "FRI"].indexOf(selectedDay)
                    ],
                    "yyyy-MM-dd",
                  )
                ].summary
              }
            </p>
          </div>
        )}
        <div className="space-y-2">
          <Label>Activity for {selectedDay}</Label>
          <Textarea
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder={`Describe your activities for ${selectedDay}...`}
            className="min-h-[150px]"
          />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label>Summary Length</Label>
              <Select value={summaryLength} onValueChange={setSummaryLength}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 words</SelectItem>
                  <SelectItem value="200">200 words</SelectItem>
                  <SelectItem value="250">250 words</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Supporting Documentation</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="w-4 h-4" />
                Upload Files
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.txt,.md,.js,.ts,.jsx,.tsx,.html,.css,.json,.py,.java,.c,.cpp"
              />
            </div>
          </div>
        </div>

        {media.length > 0 && (
          <div className="mt-4 space-y-2">
            {media.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 border rounded-md"
              >
                {file.type.startsWith("image/") ? (
                  <ImageIcon className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <div className="flex items-center gap-2 flex-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePreviewFile(file)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFile(file.name)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">{file.name}</span>
                  {uploadProgress[file.name] && (
                    <div className="mt-1 h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${uploadProgress[file.name] === -1 ? "bg-red-500" : "bg-blue-500"}`}
                        style={{
                          width: `${typeof uploadProgress[file.name] === "number" ? uploadProgress[file.name] : 0}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {submitError && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        {submitSuccess && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-md">
            <p className="text-sm text-green-600">
              Activity log submitted successfully!
            </p>
          </div>
        )}

        {generatedSummary && (
          <SummaryPreview
            summary={generatedSummary}
            onAccept={async () => {
              try {
                const {
                  data: { user },
                } = await supabase.auth.getUser();
                if (!user) throw new Error("Not authenticated");

                const selectedIndex = [
                  "MON",
                  "TUE",
                  "WED",
                  "THU",
                  "FRI",
                ].indexOf(selectedDay);
                const selectedDate = format(
                  weekDates[selectedIndex],
                  "yyyy-MM-dd",
                );

                const { error: logError } = await supabase
                  .from("activity_logs")
                  .upsert({
                    user_id: user.id,
                    date: selectedDate,
                    log: activity,
                    summary: generatedSummary,
                    summary_length: parseInt(summaryLength),
                  })
                  .select()
                  .single();

                if (logError) throw logError;

                setLogs((prev) => ({
                  ...prev,
                  [selectedDate]: {
                    log: activity,
                    summary: generatedSummary,
                  },
                }));

                setSubmitSuccess(true);
                setGeneratedSummary("");

                // Clear the saved draft for this day
                const updatedDrafts = { ...activityByDay };
                delete updatedDrafts[selectedDay];
                setActivityByDay(updatedDrafts);
                localStorage.setItem(
                  "weeklyActivityDrafts",
                  JSON.stringify({
                    drafts: updatedDrafts,
                    timestamp: Date.now(),
                  }),
                );
              } catch (error) {
                setSubmitError(error.message);
              }
            }}
            onDiscard={() => {
              setGeneratedSummary("");
            }}
          />
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            className="w-32"
            disabled={isGenerating || isUploading}
          >
            {isGenerating
              ? "Generating..."
              : isUploading
                ? "Uploading..."
                : "Submit Log"}
          </Button>
        </div>
      </form>

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>File Preview</DialogTitle>
          </DialogHeader>
          {previewType === "image" && (
            <img
              src={previewUrl!}
              alt="Preview"
              className="max-h-[80vh] object-contain"
            />
          )}
          {previewType === "text" && (
            <div className="w-full h-[80vh] p-4 overflow-y-auto bg-muted/30 rounded-md whitespace-pre-wrap font-mono text-sm">
              {previewUrl}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WeeklyActivityLog;
