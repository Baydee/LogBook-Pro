import React, { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import ActivityTracker from "./ActivityTracker";

interface HomeProps {
  initialUserData?: {
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
  const [userData] = useState(initialUserData);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleSettings = () => {
    // Implement settings logic
    console.log("Opening settings...");
  };

  const handleActivitySubmit = (data: {
    activity: string;
    summaryLength: string;
    media: File[];
  }) => {
    // Implement activity submission logic
    console.log("Submitting activity:", data);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader
        userName={userData.name}
        userEmail={userData.email}
        userAvatar={userData.avatar}
        onLogout={handleLogout}
        onSettings={handleSettings}
      />

      <div className="flex h-[calc(100vh-72px)]">
        <DashboardSidebar />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Daily Activity Tracker
            </h1>

            <ActivityTracker onActivitySubmit={handleActivitySubmit} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
