import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { format, addMonths, subMonths } from "date-fns";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AllActivityLogsProps {
  userId: string;
}

const AllActivityLogs = ({ userId }: AllActivityLogsProps) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [logs, setLogs] = useState<Record<string, any>>({});
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    loadMonthLogs();
  }, [currentMonth]);

  const loadMonthLogs = async () => {
    try {
      const startDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1,
      );
      const endDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0,
      );

      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd"));

      if (error) throw error;

      const logsByDate = {};
      data?.forEach((log) => {
        logsByDate[log.date] = {
          log: log.log,
          summary: log.summary,
          summaryLength: log.summary_length,
        };
      });

      setLogs(logsByDate);
    } catch (error) {
      console.error("Error loading logs:", error);
    }
  };

  const hasActivityLog = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return !!logs[dateStr];
  };

  const daysInWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty days for padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateStr = format(date, "yyyy-MM-dd");
    setSelectedLog(logs[dateStr]);
  };

  return (
    <Card className="w-full p-4 md:p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {daysInWeek.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {getDaysInMonth(currentMonth).map((date, index) => (
          <div
            key={index}
            className={`
              aspect-square p-2 border hover:bg-gray-50 dark:hover:bg-white cursor-pointer
              ${date === null ? "bg-muted/30" : ""}
              ${date && logs[format(date, "yyyy-MM-dd")]?.summary ? "bg-primary text-primary-foreground" : ""}
              ${
                date &&
                selectedDate &&
                format(date, "yyyy-MM-dd") ===
                  format(selectedDate, "yyyy-MM-dd")
                  ? "border-blue-500 border-2"
                  : "border-border"
              }
              hover:text-foreground dark:hover:text-black
            `}
            onClick={() => date && handleDateClick(date)}
          >
            {date && (
              <div className="h-full w-full flex flex-col items-center justify-center">
                <span className="text-sm">{format(date, "d")}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedLog && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">
            Activity Log for {format(selectedDate!, "MMMM d, yyyy")}
          </h3>
          <Card className="p-4 space-y-4">
            <div>
              <h4 className="font-medium mb-2">Activity Description</h4>
              <p className="whitespace-pre-wrap">{selectedLog.log}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">
                Summary ({selectedLog.summaryLength} words)
              </h4>
              <p>{selectedLog.summary}</p>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default AllActivityLogs;
