// @ts-nocheck
"use client";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Brain, Coffee } from "lucide-react";
export default function PomodoroTimer() {
  const [time, setTime] = useState(25*60);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<"work"|"break">("work");
  const ref = useRef<ReturnType<typeof setInterval>>();
  useEffect(()=>{if(running){ref.current=setInterval(()=>setTime(t=>t>0?t-1:0),1000)}else{clearInterval(ref.current)};return ()=>clearInterval(ref.current)},[running]);
  useEffect(()=>{if(time===0){setRunning(false);if(mode==="work"){setMode("break");setTime(5*60)}else{setMode("work");setTime(25*60)}}},[time,mode]);
  const fmt = (s:number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  const switchTo = (m:"work"|"break", sec:number) => {setRunning(false);setMode(m);setTime(sec);};
  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-center gap-3 mb-2">
        <button onClick={()=>switchTo("work",25*60)} className={`tool-btn tool-btn-secondary text-xs ${mode==="work"?"ring-2 ring-primary":""}`}><Brain className="h-4 w-4"/>Work 25min</button>
        <button onClick={()=>switchTo("break",5*60)} className={`tool-btn tool-btn-secondary text-xs ${mode==="break"?"ring-2 ring-primary":""}`}><Coffee className="h-4 w-4"/>Break 5min</button>
      </div>
      <div className={`text-7xl font-mono font-bold tracking-tighter ${time<60?"text-red-500":"text-foreground"}`}>{fmt(time)}</div>
      <p className="text-sm text-muted-foreground">{mode==="work"?"Focus time":"Break time"}</p>
      <div className="flex justify-center gap-3">
        <button onClick={()=>setRunning(!running)} className="tool-btn tool-btn-primary">{running?<Pause className="h-4 w-4"/>:<Play className="h-4 w-4"/>}{running?"Pause":"Start"}</button>
        <button onClick={()=>switchTo(mode,mode==="work"?25*60:5*60)} className="tool-btn tool-btn-secondary"><RotateCcw className="h-4 w-4"/>Reset</button>
      </div>
    </div>
  );
}