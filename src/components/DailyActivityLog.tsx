import React, { useState, useEffect } from "react";
import { generateAISummary } from "@/lib/github-ai";
import { extractTextFromFile } from "@/lib/file-processing";
import SummaryPreview from "./SummaryPreview";
import { supabase } from "@/lib/supabase";
import { uploadFile } from "@/lib/storage";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Upload, FileText, Image as ImageIcon, X, Eye } from "lucide-react";
import { validateFile } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DailyActivityLogProps {
  onSubmit?: (data: {
    activity: string;
    summaryLength: string;
    media: File[];
  }) => void;
  isOpen?: boolean;
}

const DailyActivityLog = ({
  onSubmit = () => {},
  isOpen = true,
}: DailyActivityLogProps) => {
  const [activity, setActivity] = useState("");
  const [summaryLength, setSummaryLength] = useState("100");
  const [media, setMedia] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);

  // Save activity to localStorage when it changes with expiration
  useEffect(() => {
    if (activity) {
      localStorage.setItem(
        "dailyActivityDraft",
        JSON.stringify({
          text: activity,
          timestamp: Date.now(),
        }),
      );
    }
  }, [activity]);

  // Load saved draft on component mount with expiration check
  useEffect(() => {
    const savedDraftItem = localStorage.getItem("dailyActivityDraft");
    if (savedDraftItem) {
      try {
        const savedData = JSON.parse(savedDraftItem);
        // Check if data is expired (older than 20 minutes)
        if (
          savedData.timestamp &&
          Date.now() - savedData.timestamp < 20 * 60 * 1000
        ) {
          setActivity(savedData.text);
        } else {
          // Clear expired data
          localStorage.removeItem("dailyActivityDraft");
        }
      } catch (e) {
        // Handle old format or parsing errors
        localStorage.removeItem("dailyActivityDraft");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("working_hours")
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

      const { data: companyProfile } = await supabase
        .from("user_profiles")
        .select("working_hours, company_name")
        .eq("id", user.id)
        .single();

      const summary = await generateAISummary({
        activityLog: activity,
        summaryLength: parseInt(summaryLength),
        workingHours: companyProfile?.working_hours || "9:00 AM - 5:00 PM",
        companyName: companyProfile?.company_name || "the company",
        extractedFileText: extractedText,
      });

      setGeneratedSummary(summary);
      return;
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsGenerating(false);
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
      } else if (file.type === "application/pdf") {
        const text = await extractTextFromFile(file);
        setPreviewUrl(text);
        setPreviewType("text");
      } else if (
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const text = await extractTextFromFile(file);
        setPreviewUrl(text);
        setPreviewType("text");
      } else {
        const text = await file.text();
        setPreviewUrl(text);
        setPreviewType("text");
      }
    } catch (error) {
      console.error("Error previewing file:", error);
      setSubmitError("Error previewing file: " + error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="w-full p-4 md:p-6 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="activity">Daily Activity Log</Label>
          <Textarea
            id="activity"
            placeholder="Describe your activities for today..."
            className="min-h-[200px]"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Label htmlFor="summary-length">Summary Length</Label>
            <Select value={summaryLength} onValueChange={setSummaryLength}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100 words</SelectItem>
                <SelectItem value="200">200 words</SelectItem>
                <SelectItem value="250">250 words</SelectItem>
              </SelectContent>
            </Select>
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
                        style={{ width: `${uploadProgress[file.name]}%` }}
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

                const today = new Date();
                const dateStr = format(today, "yyyy-MM-dd");

                const { error: logError } = await supabase
                  .from("activity_logs")
                  .upsert({
                    user_id: user.id,
                    date: dateStr,
                    log: activity,
                    summary: generatedSummary,
                    summary_length: parseInt(summaryLength),
                  })
                  .select()
                  .single();

                if (logError) throw logError;
                setSubmitSuccess(true);
                setGeneratedSummary("");
                setActivity("");
                localStorage.removeItem("dailyActivityDraft");
                setMedia([]);
                setUploadProgress({});
              } catch (error) {
                setSubmitError(error.message);
              }
            }}
            onDiscard={() => {
              setGeneratedSummary("");
            }}
          />
        )}

        <div className="flex justify-end gap-4">
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
          {previewType === "pdf" && (
            <iframe
              src={previewUrl!}
              className="w-full h-[80vh]"
              title="PDF Preview"
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

export default DailyActivityLog;
