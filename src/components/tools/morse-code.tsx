// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function MorseCode() {
  const process = (input: string) => {
    const mc={a:".-",b:"-...",c:"-.-.",d:"-..",e:".",f:"..-.",g:"--.",h:"....",i:"..",j:".---",k:"-.-",l:".-..",m:"--",n:"-.",o:"---",p:".--.",q:"--.-",r:".-.",s:"...",t:"-",u:"..-",v:"...-",w:".--",x:"-..-",y:"-.--",z:"--..",1:".----",2:"..---",3:"...--",4:"....-",5:".....",6:"-....",7:"--...",8:"---..",9:"----.",0:"-----"," ":"/"}; const dm={}; for(const[k,v]of Object.entries(mc)) dm[v]=k; if(input.includes(".")||input.includes("-")){return input.trim().split(/\s+/).map(w=>dm[w]||"[?]").join("");} return input.toLowerCase().split("").map(c=>mc[c]||"[?]").join(" ");
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
