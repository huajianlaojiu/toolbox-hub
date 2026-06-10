// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function ColorPalette() {
  const process = (input: string) => {
    const colors=["#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#98D8C8","#F7DC6F","#BB8FCE","#85C1E9","#F8C471","#82E0AA","#F1948A","#AED6F1","#D7BDE2"]; return colors.slice(0,5).map(c=>c+"  "+c).join("\n");
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
