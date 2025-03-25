import React from "react";
import { useTheme } from "./ThemeProvider";

interface LogoProps {
  className?: string;
}

const Logo = ({ className = "" }: LogoProps) => {
  const { theme } = useTheme();

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={
          theme === "dark"
            ? "/images/logo-darkmode.png"
            : "/images/logo-lightmode.png"
        }
        alt="LogBook Pro Logo"
        className="h-10 w-10 mr-2 object-contain"
      />
      <span className="text-xl font-semibold">LogBook Pro</span>
    </div>
  );
};

export default Logo;
