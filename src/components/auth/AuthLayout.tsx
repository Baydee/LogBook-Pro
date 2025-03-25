import ThemeToggle from "../ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 space-y-8">
        <div className="w-full max-w-sm space-y-8">{children}</div>
      </div>
    </div>
  );
}
