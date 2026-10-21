// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";
export default function PasswordStrength() {
  const process = (input: string) => {
    let score = 0;
    if (input.length >= 8) score++;
    if (input.length >= 12) score++;
    if (/[a-z]/.test(input)) score++;
    if (/[A-Z]/.test(input)) score++;
    if (/[0-9]/.test(input)) score++;
    if (/[^a-zA-Z0-9]/.test(input)) score++;
    if (input.length >= 16) score++;
    const levels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong", "Excellent"];
    const colors = ["red", "orange", "yellow", "lime", "green", "teal", "blue"];
    return "Score: " + score + "/7 (" + levels[score] + ")\nLength: " + input.length + "\nUppercase: " + (/[A-Z]/.test(input)?"Yes":"No") + "\nLowercase: " + (/[a-z]/.test(input)?"Yes":"No") + "\nNumbers: " + (/[0-9]/.test(input)?"Yes":"No") + "\nSymbols: " + (/[^a-zA-Z0-9]/.test(input)?"Yes":"No");
  };
  return <SimpleTool label="Password" placeholder="Type a password to score it" hint="Scoring happens in your browser only. The password is never sent anywhere or stored." process={process} multiline={false} />;
}