"use client";
import { useState } from "react";

function count(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const lines = text.split(/\n/).length;
  const readingMins = Math.ceil(words / 200);
  return { words, chars, charsNoSpaces, sentences, paragraphs, lines, readingMins };
}

export default function WordCounter() {
  const [text, setText] = useState("");
  const stats = count(text);

  const cards = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.chars },
    { label: "Chars (no spaces)", value: stats.charsNoSpaces },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Lines", value: stats.lines },
    { label: "Reading time", value: stats.readingMins + " min" },
  ];

  return (
    <div className="space-y-4">
      <textarea className="tool-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste or type your text here..." rows={10} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border bg-muted/30 p-3 text-center">
            <p className="text-xl font-bold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}