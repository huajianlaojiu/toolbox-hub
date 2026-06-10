// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function MetaTagGenerator() {
  const process = (input: string) => {
    const parts=input.split("|"); const title=parts[0]||"My Website"; const desc=parts[1]||"Description"; return '<title>'+title+'</title>\n<meta name="description" content="'+desc+'">\n<meta property="og:title" content="'+title+'">\n<meta property="og:description" content="'+desc+'">';
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
