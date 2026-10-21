// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";
export default function UrlExtractor() {
  const process = (input: string) => {
    const urls = input.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi) || [];
    return urls.length ? urls.join("\n") : "No URLs found in the text.";
  };
  return <SimpleTool label="Text" placeholder="Paste an email, a log line or a document containing links..." hint="Every http and https link found in the text is listed, one per line." process={process} />;
}