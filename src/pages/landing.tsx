import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Logo />
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="hidden md:inline-flex"
              onClick={() => navigate("/auth/signin")}
            >
              Sign In
            </Button>
            <Button
              className="hidden md:inline-flex"
              onClick={() => navigate("/auth/signup")}
            >
              Get Started
            </Button>
            <Button
              className="md:hidden"
              onClick={() => navigate("/auth/signin")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      <main className="container py-12 md:py-24 space-y-12 md:space-y-24 px-4 md:px-6">
        <section className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Track Your Internship Journey
          </h1>
          <p className="max-w-[700px] text-base md:text-lg text-muted-foreground">
            A professional platform to document and summarize your internship
            activities with AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => navigate("/auth/signup")}
            >
              Start for Free
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
