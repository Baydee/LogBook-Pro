import React, { useState } from "react";
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
import { Upload, FileText, Image as ImageIcon } from "lucide-react";
import AudioRecorder from "./AudioRecorder";

interface ActivityLogFormProps {
  onSubmit?: (data: {
    activity: string;
    summaryLength: string;
    media: File[];
  }) => void;
  isOpen?: boolean;
}

const ActivityLogForm = ({
  onSubmit = () => {},
  isOpen = true,
}: ActivityLogFormProps) => {
  const [activity, setActivity] = useState("");
  const [summaryLength, setSummaryLength] = useState("100");
  const [media, setMedia] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ activity, summaryLength, media });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMedia(Array.from(e.target.files));
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="w-full max-w-3xl p-6 bg-white shadow-lg">
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

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Label htmlFor="summary-length">Summary Length</Label>
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
          <div className="flex items-center gap-2">
            <AudioRecorder
              onAudioSave={(audioBlob) => {
                // Here you would typically transcribe the audio
                // For now we'll just log it
                console.log("Audio recorded for activity log:", audioBlob);
              }}
            />
            <span className="text-sm font-medium">Audio Log</span>
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
              accept="image/*,.pdf,.doc,.docx"
            />
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
                  <span className="text-sm">{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" className="w-32">
            Submit Log
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ActivityLogForm;
