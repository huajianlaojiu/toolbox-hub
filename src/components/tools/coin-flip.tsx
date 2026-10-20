// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function CoinFlip() {
  const process = (input: string) => {
    return Math.random()<0.5?"Heads! ":"Tails! "
  };
  return <SimpleTool process={process} showInput={false} btnLabel="Flip" />;
}
