import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "../ThemeProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
      <div className="flex-1 flex flex-col items-center justify-center px-4 space-y-8">
        <div className="w-full max-w-sm space-y-8">{children}</div>
      </div>
    </div>
  );
}
