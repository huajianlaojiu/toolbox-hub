// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function SqlFormatter() {
  const process = (input: string) => {
    return input.replace(/s+/g," ").replace(/(SELECT|FROM|WHERE|AND|OR|JOIN|ON|GROUP BY|ORDER BY|HAVING|INSERT|UPDATE|DELETE|SET|VALUES|INTO|CREATE|ALTER|DROP|LIMIT|OFFSET|AS|IN|NOT|NULL|IS|LIKE|BETWEEN|EXISTS|UNION|ALL|DISTINCT|COUNT|SUM|AVG|MAX|MIN)/gi,"\n$1").replace(/,/g,",\n  ").trim();
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
