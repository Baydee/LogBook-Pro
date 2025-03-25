import React, { useState } from "react";
import ClockControls from "./ClockControls";
import ActivityLogForm from "./ActivityLogForm";

interface ActivityTrackerProps {
  onActivitySubmit?: (data: {
    activity: string;
    summaryLength: string;
    media: File[];
  }) => void;
}

const ActivityTracker = ({
  onActivitySubmit = () => {},
}: ActivityTrackerProps) => {
  const [isClocked, setIsClocked] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);

  const handleClockIn = () => {
    setIsClocked(true);
  };

  const handleClockOut = () => {
    setIsClocked(false);
    setShowActivityForm(true);
  };

  const handleActivitySubmit = (data: {
    activity: string;
    summaryLength: string;
    media: File[];
  }) => {
    onActivitySubmit(data);
    setShowActivityForm(false);
  };

  return (
    <div className="w-full max-w-[1200px] min-h-[600px] p-4 md:p-6 bg-card rounded-lg shadow-sm">
      <div className="flex flex-col items-center space-y-8">
        <div className="w-full flex justify-center">
          <ClockControls
            isClocked={isClocked}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
          />
        </div>

        <div className="w-full flex justify-center">
          <ActivityLogForm
            isOpen={showActivityForm}
            onSubmit={handleActivitySubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default ActivityTracker;
