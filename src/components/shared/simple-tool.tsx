"use client";
import { useState } from "react";
import CopyButton from "@/components/copy-button";
import { useI18n } from "@/lib/i18n";

interface SimpleToolProps {
  label?: string;
  placeholder?: string;
  hint?: string;
  process: (input: string) => string;
  multiline?: boolean;
  showInput?: boolean;
  btnLabel?: string;
}

// label / placeholder / hint / btnLabel 由调用方以英文原文传入，在此统一翻译。
// 字典里没有对应译文时 t() 回退英文，不会开天窗；这样 30+ 个复用本组件的工具
// 无需各自引入 i18n 也能得到本地化的交互区。
export default function SimpleTool({ label, placeholder = "", hint = "", process, multiline = true, showInput = true, btnLabel }: SimpleToolProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { t } = useI18n();
  const inputLabel = t(label ?? "Input");
  const processLabel = t(btnLabel ?? "Process");

  const handleProcess = () => {
    if (!input.trim() && showInput) return;
    setOutput(process(showInput ? input : input || "generate"));
  };

  return (
    <div className="space-y-4">
      {showInput && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">{inputLabel}</label>
          {multiline ? (
            <textarea className="tool-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t(placeholder)} spellCheck={false} />
          ) : (
            <input className="tool-input tool-input-sm font-sans" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t(placeholder)} />
          )}
          {hint && <p className="mt-2 text-xs text-muted-foreground">{t(hint)}</p>}
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={handleProcess} className="tool-btn tool-btn-primary">{processLabel}</button>
        <button onClick={() => { setInput(""); setOutput(""); }} className="tool-btn tool-btn-secondary">{t("Clear")}</button>
      </div>
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">{t("Result")}</label>
            <CopyButton text={output} />
          </div>
          <pre className="tool-result max-h-96 overflow-auto">{output}</pre>
        </div>
      )}
    </div>
  );
}