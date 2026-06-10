// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function OpenGraphGenerator() {
  const process = (input: string) => {
    const parts=input.split("|"); const url=parts[0]||"https://example.com"; const title=parts[1]||"Page Title"; const desc=parts[2]||"Description"; return '<meta property="og:url" content="'+url+'">\n<meta property="og:title" content="'+title+'">\n<meta property="og:description" content="'+desc+'">\n<meta property="og:type" content="website">';
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
