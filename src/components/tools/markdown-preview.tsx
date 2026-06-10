"use client";
import { useState } from "react";
import { Eye, Pencil } from "lucide-react";

export default function MarkdownPreview() {
  const [text, setText] = useState(`# Welcome to Markdown

**Bold text** and *italic text*.

## Features
- Lists work
- [Links work](https://example.com)
- \`inline code\`

\`\`\`js
console.log("code blocks too");
\`\`\`

> Blockquotes are supported.

| Table | Works |
|-------|-------|
| Row 1 | Value |
`);

  const [preview, setPreview] = useState(false);

  const renderMarkdown = (md: string): string => {
    let html = md
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`{3}(\w*)\n([\s\S]*?)`{3}/g, '<pre><code>$2</code></pre>')
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\n\n/g, "</p><p>")
      .replace(/^(.+)$/gm, (m) => m.startsWith("<") ? m : "<p>" + m + "</p>");
    return html;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setPreview(false)} className={`tool-btn ${!preview ? "tool-btn-primary" : "tool-btn-secondary"}`}><Pencil className="h-4 w-4" />Edit</button>
        <button onClick={() => setPreview(true)} className={`tool-btn ${preview ? "tool-btn-primary" : "tool-btn-secondary"}`}><Eye className="h-4 w-4" />Preview</button>
      </div>
      {preview ? (
        <div className="rounded-lg border bg-card p-6 prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }} />
      ) : (
        <textarea className="tool-input" style={{ minHeight: 400 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write Markdown here..." />
      )}
    </div>
  );
}