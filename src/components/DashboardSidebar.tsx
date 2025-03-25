import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { format } from "date-fns";
import { Building2, Clock, CalendarRange } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface DashboardSidebarProps {}

const DashboardSidebar = ({}: DashboardSidebarProps) => {
  const [profile, setProfile] = useState({
    company_name: "",
    supervisor_name: "",
    department: "",
    internship_start_date: new Date(),
    internship_end_date: new Date(),
    working_hours: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        if (data) {
          setProfile({
            ...data,
            internship_start_date: new Date(data.internship_start_date),
            internship_end_date: new Date(data.internship_end_date),
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="w-[280px] h-full bg-muted/30 border-r p-4 space-y-4 overflow-hidden">
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Workplace Details</h3>
        </div>
        <Separator />

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">
              Company Name
            </Label>
            <p className="mt-1 text-sm font-medium">{profile.company_name}</p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">
              Work Supervisor
            </Label>
            <p className="mt-1 text-sm font-medium">
              {profile.supervisor_name}
            </p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Department</Label>
            <p className="mt-1 text-sm font-medium">{profile.department}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Schedule</h3>
        </div>
        <Separator />

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">
              Working Hours
            </Label>
            <p className="mt-1 text-sm font-medium">{profile.working_hours}</p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Start Date</Label>
            <p className="mt-1 text-sm font-medium">
              {format(profile.internship_start_date, "PPP")}
            </p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">End Date</Label>
            <p className="mt-1 text-sm font-medium">
              {format(profile.internship_end_date, "PPP")}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <CalendarRange className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Duration Overview</h3>
        </div>
        <Separator className="mb-4" />
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            Total Weeks:{" "}
            {Math.ceil(
              (profile.internship_end_date.getTime() -
                profile.internship_start_date.getTime()) /
                (1000 * 60 * 60 * 24 * 7),
            )}
          </p>
          <p>
            Days Remaining:{" "}
            {Math.ceil(
              (profile.internship_end_date.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24),
            )}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default DashboardSidebar;
