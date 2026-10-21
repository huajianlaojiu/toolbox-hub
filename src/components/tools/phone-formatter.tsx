// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";
export default function PhoneFormatter() {
  const process = (input: string) => {
    const digits = input.replace(/\D/g, "");
    if (digits.length === 10) return "(" + digits.slice(0,3) + ") " + digits.slice(3,6) + "-" + digits.slice(6);
    if (digits.length === 11) return digits.slice(0,1) + " (" + digits.slice(1,4) + ") " + digits.slice(4,7) + "-" + digits.slice(7);
    if (digits.length === 7) return digits.slice(0,3) + "-" + digits.slice(3);
    return "International: " + (digits.startsWith("1") ? "+" : "") + digits + "\nLocal: " + input + "\nDigits: " + digits.length;
  };
  return <SimpleTool label="Phone Number" placeholder="1234567890 or +1 555-123-4567" hint="Formats a single number. Anything that is not a plausible number is reported as invalid." process={process} multiline={false} />;
}