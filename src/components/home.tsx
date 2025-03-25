import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import WeeklyActivityLog from "./WeeklyActivityLog";
import DailyActivityLog from "./DailyActivityLog";
import AllActivityLogs from "./AllActivityLogs";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { generateAISummary } from "@/lib/github-ai";
import { format } from "date-fns";

interface HomeProps {
  initialUserData?: {
    id?: string;
    name: string;
    email: string;
    avatar: string;
  };
}

const Home = ({
  initialUserData = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
}: HomeProps) => {
  const [userData, setUserData] = useState(initialUserData);
  const [activeTab, setActiveTab] = useState("daily");
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth/signin");
          return;
        }

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!profile) {
          navigate("/auth/onboarding");
          return;
        }

        setUserData({
          id: user.id,
          name: profile.full_name,
          email: user.email || "",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`,
        });
      } catch (error) {
        console.error("Error checking profile:", error);
        navigate("/auth/signin");
      }
    };

    checkProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleActivitySubmit = async (data: {
    activity: string;
    summaryLength: string;
    media: File[];
  }) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("working_hours")
        .eq("id", user.id)
        .single();

      const { data: companyProfile } = await supabase
        .from("user_profiles")
        .select("working_hours, company_name")
        .eq("id", user.id)
        .single();

      const summary = await generateAISummary({
        activityLog: data.activity,
        summaryLength: parseInt(data.summaryLength),
        workingHours: companyProfile?.working_hours || "9:00 AM - 5:00 PM",
        companyName: companyProfile?.company_name || "the company",
      });

      const today = new Date();
      const dateStr = format(today, "yyyy-MM-dd");

      const { error } = await supabase.from("activity_logs").upsert({
        user_id: user.id,
        date: dateStr,
        log: data.activity,
        summary: summary,
        summary_length: parseInt(data.summaryLength),
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error submitting activity:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50">
        <DashboardHeader
          userName={userData.name}
          userEmail={userData.email}
          userAvatar={userData.avatar}
          onLogout={handleLogout}
          onSettings={handleSettings}
        />
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="md:sticky top-[72px] md:h-[calc(100vh-72px)] w-full md:w-auto">
          <DashboardSidebar />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Tabs
              defaultValue="daily"
              className="space-y-6"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="w-full md:w-auto grid grid-cols-3 md:inline-flex">
                <TabsTrigger value="daily">Daily Activity</TabsTrigger>
                <TabsTrigger value="weekly">Weekly Summary</TabsTrigger>
                <TabsTrigger value="all">All Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="daily">
                <h2 className="text-xl md:text-2xl font-semibold mb-6">
                  Daily Activity Log
                </h2>
                <DailyActivityLog onSubmit={handleActivitySubmit} />
              </TabsContent>

              <TabsContent value="weekly">
                <h2 className="text-xl md:text-2xl font-semibold mb-6">
                  Weekly Activity Summary
                </h2>
                <WeeklyActivityLog userId={userData?.id || ""} />
              </TabsContent>

              <TabsContent value="all">
                <h2 className="text-xl md:text-2xl font-semibold mb-6">
                  Activity History
                </h2>
                <AllActivityLogs userId={userData?.id || ""} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
