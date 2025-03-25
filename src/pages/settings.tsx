import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profile, setProfile] = useState({
    full_name: "",
    supervisor_name: "",
    company_name: "",
    department: "",
    internship_start_date: new Date(),
    internship_end_date: new Date(),
    working_hours: "",
    work_mode: "onsite",
    working_days: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
    },
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

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

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_profiles")
        .update(profile)
        .eq("id", user.id);

      if (error) throw error;
      setSuccess("Profile updated successfully");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (passwords.new !== passwords.confirm) {
      setError("New passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      });

      if (error) throw error;
      setSuccess("Password updated successfully");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">Profile Information</h2>
        <Separator />

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) =>
                setProfile({ ...profile, full_name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={profile.company_name}
              onChange={(e) =>
                setProfile({ ...profile, company_name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supervisor_name">Supervisor Name</Label>
            <Input
              id="supervisor_name"
              value={profile.supervisor_name}
              onChange={(e) =>
                setProfile({ ...profile, supervisor_name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={profile.department}
              onChange={(e) =>
                setProfile({ ...profile, department: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Internship Duration</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-xs text-gray-500">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(profile.internship_start_date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={profile.internship_start_date}
                      onSelect={(date) =>
                        date &&
                        setProfile({ ...profile, internship_start_date: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1">
                <Label className="text-xs text-gray-500">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(profile.internship_end_date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={profile.internship_end_date}
                      onSelect={(date) =>
                        date &&
                        setProfile({ ...profile, internship_end_date: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="working_hours">Working Hours</Label>
            <Input
              id="working_hours"
              value={profile.working_hours}
              onChange={(e) =>
                setProfile({ ...profile, working_hours: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Work Mode</Label>
            <RadioGroup
              value={profile.work_mode}
              onValueChange={(value) =>
                setProfile({ ...profile, work_mode: value })
              }
              className="flex flex-col space-y-2 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="onsite" id="settings-onsite" />
                <Label htmlFor="settings-onsite">Onsite (Office)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="remote" id="settings-remote" />
                <Label htmlFor="settings-remote">Remote (Work from Home)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hybrid" id="settings-hybrid" />
                <Label htmlFor="settings-hybrid">Hybrid</Label>
              </div>
            </RadioGroup>
          </div>

          {profile.work_mode === "hybrid" && (
            <div className="space-y-2 p-4 border rounded-md bg-muted/30">
              <Label className="font-medium">
                Select Working Days (Office)
              </Label>
              <div className="grid grid-cols-5 gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="settings-monday"
                    checked={profile.working_days?.monday}
                    onCheckedChange={(checked) =>
                      setProfile({
                        ...profile,
                        working_days: {
                          ...profile.working_days,
                          monday: checked === true,
                        },
                      })
                    }
                  />
                  <Label htmlFor="settings-monday">Monday</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="settings-tuesday"
                    checked={profile.working_days?.tuesday}
                    onCheckedChange={(checked) =>
                      setProfile({
                        ...profile,
                        working_days: {
                          ...profile.working_days,
                          tuesday: checked === true,
                        },
                      })
                    }
                  />
                  <Label htmlFor="settings-tuesday">Tuesday</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="settings-wednesday"
                    checked={profile.working_days?.wednesday}
                    onCheckedChange={(checked) =>
                      setProfile({
                        ...profile,
                        working_days: {
                          ...profile.working_days,
                          wednesday: checked === true,
                        },
                      })
                    }
                  />
                  <Label htmlFor="settings-wednesday">Wednesday</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="settings-thursday"
                    checked={profile.working_days?.thursday}
                    onCheckedChange={(checked) =>
                      setProfile({
                        ...profile,
                        working_days: {
                          ...profile.working_days,
                          thursday: checked === true,
                        },
                      })
                    }
                  />
                  <Label htmlFor="settings-thursday">Thursday</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="settings-friday"
                    checked={profile.working_days?.friday}
                    onCheckedChange={(checked) =>
                      setProfile({
                        ...profile,
                        working_days: {
                          ...profile.working_days,
                          friday: checked === true,
                        },
                      })
                    }
                  />
                  <Label htmlFor="settings-friday">Friday</Label>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>

      <Card className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">Change Password</h2>
        <Separator />

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <Input
              id="new_password"
              type="password"
              value={passwords.new}
              onChange={(e) =>
                setPasswords({ ...passwords, new: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <Input
              id="confirm_password"
              type="password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
              required
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </Card>

      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
      {success && <p className="text-sm text-green-500 mt-4">{success}</p>}
    </div>
  );
}
