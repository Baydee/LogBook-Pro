import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>

      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">LogBook Pro</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/auth/signin")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth/signup")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="container py-24 space-y-24">
        <section className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Track Your Internship Journey
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            A professional platform to document and summarize your internship
            activities with AI-powered insights.
          </p>
          <div className="flex items-center space-x-4">
            <Button size="lg" onClick={() => navigate("/auth/signup")}>
              Start for Free
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              title: "Smart Activity Logging",
              description:
                "Effortlessly track your daily activities with our intuitive interface and AI assistance.",
            },
            {
              title: "Time Management",
              description:
                "Built-in clock in/out system to accurately track your work hours and breaks.",
            },
            {
              title: "Progress Insights",
              description:
                "Get AI-generated summaries and insights about your internship journey.",
            },
          ].map((feature, i) => (
            <div key={i} className="space-y-2">
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
