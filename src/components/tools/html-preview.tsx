// @ts-nocheck
"use client";
import { useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { useI18n } from "@/lib/i18n";
export default function HtmlPreview() {
  const { t } = useI18n();
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setPreview(false)} className={"tool-btn " + (!preview ? "tool-btn-primary" : "tool-btn-secondary")}><Pencil className="h-4 w-4" />Edit</button>
        <button onClick={() => setPreview(true)} className={"tool-btn " + (preview ? "tool-btn-primary" : "tool-btn-secondary")}><Eye className="h-4 w-4" />{t("Preview")}</button>
      </div>
      {preview ? (
        <div className="rounded-lg border bg-white p-4 min-h-[200px]" dangerouslySetInnerHTML={{ __html: code }} />
      ) : (
        <textarea className="tool-input" style={{ minHeight: 200 }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="<h1>Hello World</h1>\n<p>Enter HTML here...</p>" spellCheck={false} />
      )}
    </div>
  );
}