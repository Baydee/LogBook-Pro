import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Timer, TimerOff, Play, Pause } from "lucide-react";

interface ClockControlsProps {
  onClockIn?: () => void;
  onClockOut?: () => void;
  isClocked?: boolean;
}

const ClockControls = ({
  onClockIn = () => {},
  onClockOut = () => {},
  isClocked = false,
}: ClockControlsProps) => {
  const [time, setTime] = useState<string>("00:00:00");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    let intervalId: number;

    if (isRunning) {
      intervalId = window.setInterval(() => {
        const now = Date.now();
        const diff = now - (startTime || now);
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        setTime(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        );
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, startTime]);

  const handleClockIn = () => {
    setIsRunning(true);
    setStartTime(Date.now());
    onClockIn();
  };

  const handleClockOut = () => {
    setIsRunning(false);
    setStartTime(null);
    setTime("00:00:00");
    onClockOut();
  };

  return (
    <Card className="p-6 bg-white w-[300px] h-[160px] shadow-lg">
      <div className="flex flex-col items-center space-y-4">
        <div className="text-3xl font-mono font-bold text-gray-800">{time}</div>

        <div className="flex items-center space-x-4">
          {!isClocked ? (
            <Button
              variant="default"
              className="w-32 bg-green-600 hover:bg-green-700"
              onClick={handleClockIn}
            >
              <Play className="mr-2 h-4 w-4" />
              Clock In
            </Button>
          ) : (
            <Button
              variant="destructive"
              className="w-32"
              onClick={handleClockOut}
            >
              <Pause className="mr-2 h-4 w-4" />
              Clock Out
            </Button>
          )}
        </div>

        <div className="text-sm text-gray-500">
          {isClocked ? (
            <div className="flex items-center">
              <Timer className="mr-1 h-4 w-4 text-green-500" />
              Currently Clocked In
            </div>
          ) : (
            <div className="flex items-center">
              <TimerOff className="mr-1 h-4 w-4 text-red-500" />
              Not Clocked In
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ClockControls;
