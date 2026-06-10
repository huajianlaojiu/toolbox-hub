"use client";
import { useState } from "react";
import CopyButton from "@/components/copy-button";

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export default function TextToSlug() {
  const [input, setInput] = useState("");
  const slug = slugify(input);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Text to Slugify</label>
        <input className="tool-input tool-input-sm font-sans" value={input} onChange={(e) => setInput(e.target.value)} placeholder="My Blog Post Title!" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground">URL Slug</label>
          {slug && <CopyButton text={slug} />}
        </div>
        <div className="tool-result font-mono text-lg font-medium">{slug || <span className="text-muted-foreground">—</span>}</div>
      </div>
    </div>
  );
}