import React from "react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setTheme("light")}
        className={`px-3 py-1 rounded ${theme === "light" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
      >
        Light
      </button>

      <button
        onClick={() => setTheme("dark")}
        className={`px-3 py-1 rounded ${theme === "dark" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
      >
        Dark
      </button>

      <button
        onClick={() => setTheme("system")}
        className={`px-3 py-1 rounded ${theme === "system" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
      >
        System
      </button>
    </div>
  );
};

export default ThemeToggle;
