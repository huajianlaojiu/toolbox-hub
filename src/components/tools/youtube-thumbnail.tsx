// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function YoutubeThumbnail() {
  const process = (input: string) => {
    const m=input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/); if(!m) return "Enter a YouTube URL"; const id=m[1]; return "https://img.youtube.com/vi/"+id+"/maxresdefault.jpg\n\nhttps://img.youtube.com/vi/"+id+"/hqdefault.jpg\n\nhttps://img.youtube.com/vi/"+id+"/mqdefault.jpg";
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
