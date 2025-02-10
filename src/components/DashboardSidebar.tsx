import React, { useState } from "react";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import AudioRecorder from "./AudioRecorder";
import {
  Calendar as CalendarIcon,
  Building2,
  Clock,
  CalendarRange,
} from "lucide-react";

interface DashboardSidebarProps {
  workplaceDetails?: {
    companyName: string;
    supervisorName: string;
    department: string;
  };
  schedulePreferences?: {
    startDate: Date;
    endDate: Date;
    workingHours: string;
  };
}

const DashboardSidebar = ({
  workplaceDetails = {
    companyName: "Tech Corp Inc.",
    supervisorName: "John Smith",
    department: "Software Development",
  },
  schedulePreferences = {
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    workingHours: "9:00 AM - 5:00 PM",
  },
}: DashboardSidebarProps) => {
  const [startDate, setStartDate] = useState<Date>(
    schedulePreferences.startDate,
  );
  const [endDate, setEndDate] = useState<Date>(schedulePreferences.endDate);

  return (
    <div className="w-[280px] h-full bg-gray-50 border-r p-4 space-y-6">
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold">Workplace Details</h3>
        </div>
        <Separator />

        <div className="space-y-3">
          <div>
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              value={workplaceDetails.companyName}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="supervisor">Work Supervisor Name</Label>
            <div className="space-y-2">
              <Input
                id="supervisor"
                value={workplaceDetails.supervisorName}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={workplaceDetails.department}
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold">Schedule Preferences</h3>
        </div>
        <Separator />

        <div className="space-y-3">
          <div>
            <Label>Internship Duration</Label>
            <div className="space-y-2 mt-1">
              <div>
                <Label className="text-xs text-gray-500">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-xs text-gray-500">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(endDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="hours">Working Hours</Label>
            <Input
              id="hours"
              value={schedulePreferences.workingHours}
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <CalendarRange className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold">Duration Overview</h3>
        </div>
        <Separator className="mb-4" />
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            Total Weeks:{" "}
            {Math.ceil(
              (endDate.getTime() - startDate.getTime()) /
                (1000 * 60 * 60 * 24 * 7),
            )}
          </p>
          <p>
            Days Remaining:{" "}
            {Math.ceil(
              (endDate.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24),
            )}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default DashboardSidebar;
