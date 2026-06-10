// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function RomanNumerals() {
  const process = (input: string) => {
    const rn={M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1}; if(/^[MDCLXVI]+$/i.test(input.trim())){ let n=0; let s=input.trim().toUpperCase(); for(let i=0;i<s.length;i++){ const c1=rn[s[i]]||0; const c2=rn[s[i+1]]||0; n+=c1<c2?-c1:c1; } return input+" = "+n; } let n=parseInt(input,10); if(!n||n<1||n>3999) return "Enter 1-3999"; let r=""; for(const[k,v]of Object.entries(rn)){while(n>=v){r+=k;n-=v;}} return input+" = "+r;
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
