import { Suspense, useEffect } from "react";
import { Routes, Route, useNavigate, useRoutes } from "react-router-dom";
import Home from "./components/home";
import LandingPage from "./pages/landing";
import SignInPage from "./pages/auth/signin";
import SignUpPage from "./pages/auth/signup";
import OnboardingPage from "./pages/auth/onboarding";
import SettingsPage from "./pages/settings";
import ThemeProvider from "./components/ThemeProvider";
import { supabase } from "./lib/supabase";
import routes from "tempo-routes";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Don't redirect if on landing page or auth pages
        const isAuthPath =
          window.location.pathname.startsWith("/auth/") ||
          window.location.pathname === "/";
        if (!session && !isAuthPath) {
          navigate("/auth/signin");
          return;
        }

        if (session) {
          // Don't check profile if already on onboarding
          if (window.location.pathname === "/auth/onboarding") {
            return;
          }

          const { data: profile } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (!profile) {
            navigate("/auth/onboarding");
            return;
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
        // Only redirect to signin if not already on an auth page
        if (!window.location.pathname.startsWith("/auth/")) {
          navigate("/auth/signin");
        }
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <ThemeProvider defaultTheme="light">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            Loading...
          </div>
        }
      >
        {/* For the tempo routes */}
        {import.meta.env.VITE_TEMPO && useRoutes(routes)}

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/signin" element={<SignInPage />} />
          <Route path="/auth/signup" element={<SignUpPage />} />
          <Route path="/auth/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Add this before the catchall route */}
          {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
