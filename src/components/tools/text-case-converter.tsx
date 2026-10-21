// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function TextCaseConverter() {
  const process = (input: string) => {
    return "UPPERCASE:\n"+input.toUpperCase()+"\n\nlowercase:\n"+input.toLowerCase()+"\n\nTitle Case:\n"+input.replace(/wS*/g,t=>t.charAt(0).toUpperCase()+t.substr(1).toLowerCase());
  };
  return <SimpleTool label="Text" placeholder="hello world" hint="Produces upper, lower, title, sentence and camel style variants of the same text." process={process} />;
}
