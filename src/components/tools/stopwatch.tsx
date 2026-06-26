// @ts-nocheck
"use client";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Flag } from "lucide-react";
export default function Stopwatch() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const ref = useRef<ReturnType<typeof setInterval>>();
  useEffect(()=>{if(running){ref.current=setInterval(()=>setTime(t=>t+10),10)}else{clearInterval(ref.current)}return ()=>clearInterval(ref.current)},[running]);
  const fmt = (ms:number) => {const m=Math.floor(ms/60000),s=Math.floor((ms%60000)/1000),c=Math.floor((ms%1000)/10);return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${String(c).padStart(2,"0")}`;};
  return (
    <div className="space-y-4 text-center">
      <div className="text-6xl font-mono font-bold tracking-tighter text-foreground">{fmt(time)}</div>
      <div className="flex justify-center gap-3">
        <button onClick={()=>setRunning(!running)} className="tool-btn tool-btn-primary">{running?<Pause className="h-4 w-4"/>:<Play className="h-4 w-4"/>}{running?"Pause":"Start"}</button>
        <button onClick={()=>{setTime(0);setRunning(false);setLaps([])}} className="tool-btn tool-btn-secondary"><RotateCcw className="h-4 w-4"/>Reset</button>
        <button onClick={()=>running&&setLaps([...laps,time])} className="tool-btn tool-btn-secondary"><Flag className="h-4 w-4"/>Lap</button>
      </div>
      {laps.length>0&&(<div className="max-h-48 overflow-auto rounded-lg border"><table className="w-full text-sm"><tbody>{laps.map((l,i)=>(<tr key={i} className="border-t"><td className="px-4 py-2 text-muted-foreground">Lap {i+1}</td><td className="px-4 py-2 font-mono">{fmt(l)}</td><td className="px-4 py-2 text-muted-foreground">{i>0?`+${fmt(l-laps[i-1])}`:"—"}</td></tr>))}</tbody></table></div>)}
    </div>
  );
}