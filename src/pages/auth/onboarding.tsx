import AuthLayout from "@/components/auth/AuthLayout";
import OnboardingForm from "@/components/auth/OnboardingForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth/signin");
        return;
      }

      // Check if user already has a profile
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        navigate("/dashboard");
        return;
      }

      setUserId(session.user.id);
    };

    checkSession();
  }, [navigate]);

  if (!userId) return null;

  return (
    <AuthLayout>
      <OnboardingForm userId={userId} />
    </AuthLayout>
  );
}
