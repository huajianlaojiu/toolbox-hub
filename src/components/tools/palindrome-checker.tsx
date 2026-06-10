// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function PalindromeChecker() {
  const process = (input: string) => {
    const s = input.toLowerCase().replace(/[^a-z0-9]/g, "");
    const r = s.split("").reverse().join("");
    if (!s) return "Enter some text to check";
    if (s === r) return 'YES - "' + input + '" is a palindrome!';
    return 'NO - "' + input + '" is NOT a palindrome.\nForward: ' + s + '\nBackward: ' + r;
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
