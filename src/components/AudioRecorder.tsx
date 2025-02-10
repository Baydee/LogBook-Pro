import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Mic, Square, Play, Save } from "lucide-react";

interface AudioRecorderProps {
  onAudioSave?: (audioBlob: Blob) => void;
}

const AudioRecorder = ({ onAudioSave = () => {} }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioURL) {
      const audio = new Audio(audioURL);
      audio.play();
    }
  };

  const saveAudio = () => {
    if (chunksRef.current.length > 0) {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
      onAudioSave(audioBlob);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={stopRecording}
        >
          <Square className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={startRecording}
        >
          <Mic className="h-4 w-4" />
        </Button>
      )}

      {audioURL && !isRecording && (
        <>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={playAudio}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={saveAudio}
          >
            <Save className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};

export default AudioRecorder;
