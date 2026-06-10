// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function PomodoroTimer() {
  const process = (input: string) => {
    return "Pomodoro Timer\n25 min work + 5 min break\n[Interactive timer - future feature]\nCurrent time: "+new Date().toLocaleTimeString();
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
