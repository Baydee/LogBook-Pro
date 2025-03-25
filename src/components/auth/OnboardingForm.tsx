import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export default function OnboardingForm({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    supervisor_name: "",
    company_name: "",
    department: "",
    internship_start_date: new Date(),
    internship_end_date: new Date(
      new Date().setMonth(new Date().getMonth() + 3),
    ),
    working_hours: "9:00 AM - 5:00 PM",
    work_mode: "onsite",
    working_days: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.from("user_profiles").insert([
        {
          id: userId,
          ...formData,
        },
      ]);

      if (error) throw error;
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 md:p-6 space-y-6 w-full max-w-2xl mx-auto">
      <div className="space-y-2 text-center">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          Complete Your Profile
        </h1>
        <p className="text-muted-foreground">
          Tell us about your internship details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            placeholder="John Doe"
            value={formData.full_name}
            onChange={(e) =>
              setFormData({ ...formData, full_name: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            placeholder="Tech Corp Inc."
            value={formData.company_name}
            onChange={(e) =>
              setFormData({ ...formData, company_name: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supervisor_name">Supervisor Name</Label>
          <Input
            id="supervisor_name"
            placeholder="Jane Smith"
            value={formData.supervisor_name}
            onChange={(e) =>
              setFormData({ ...formData, supervisor_name: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            placeholder="Software Development"
            value={formData.department}
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Internship Duration</Label>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">
                Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.internship_start_date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.internship_start_date}
                    onSelect={(date) =>
                      date &&
                      setFormData({ ...formData, internship_start_date: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.internship_end_date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.internship_end_date}
                    onSelect={(date) =>
                      date &&
                      setFormData({ ...formData, internship_end_date: date })
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
            placeholder="9:00 AM - 5:00 PM"
            value={formData.working_hours}
            onChange={(e) =>
              setFormData({ ...formData, working_hours: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Work Mode</Label>
          <RadioGroup
            value={formData.work_mode}
            onValueChange={(value) =>
              setFormData({ ...formData, work_mode: value })
            }
            className="flex flex-col space-y-2 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="onsite" id="onsite" />
              <Label htmlFor="onsite">Onsite (Office)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="remote" id="remote" />
              <Label htmlFor="remote">Remote (Work from Home)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hybrid" id="hybrid" />
              <Label htmlFor="hybrid">Hybrid</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.work_mode === "hybrid" && (
          <div className="space-y-2 p-4 border rounded-md bg-muted/30">
            <Label className="font-medium">Select Working Days (Office)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="monday"
                  checked={formData.working_days.monday}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      working_days: {
                        ...formData.working_days,
                        monday: checked === true,
                      },
                    })
                  }
                />
                <Label htmlFor="monday">Monday</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tuesday"
                  checked={formData.working_days.tuesday}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      working_days: {
                        ...formData.working_days,
                        tuesday: checked === true,
                      },
                    })
                  }
                />
                <Label htmlFor="tuesday">Tuesday</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="wednesday"
                  checked={formData.working_days.wednesday}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      working_days: {
                        ...formData.working_days,
                        wednesday: checked === true,
                      },
                    })
                  }
                />
                <Label htmlFor="wednesday">Wednesday</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="thursday"
                  checked={formData.working_days.thursday}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      working_days: {
                        ...formData.working_days,
                        thursday: checked === true,
                      },
                    })
                  }
                />
                <Label htmlFor="thursday">Thursday</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="friday"
                  checked={formData.working_days.friday}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      working_days: {
                        ...formData.working_days,
                        friday: checked === true,
                      },
                    })
                  }
                />
                <Label htmlFor="friday">Friday</Label>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Complete Setup"}
        </Button>
      </form>
    </Card>
  );
}
