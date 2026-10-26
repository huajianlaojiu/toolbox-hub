import { Wrench, Film, Music, Scissors, Camera, Combine, Gauge, Repeat, Minimize2, FlipHorizontal2, FileAudio, Video, Code2, Archive, FileCode, GitBranch, ScanText, Table2 } from "lucide-react";
import type { ComponentType } from "react";

/** tools-data 里的 icon 字符串 → lucide 组件（client 组件安全传递） */
export const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  wrench: Wrench,
  minimize: Minimize2,
  repeat: Repeat,
  combine: Combine,
  gauge: Gauge,
  flip: FlipHorizontal2,
  scissors: Scissors,
  film: Film,
  music: Music,
  camera: Camera,
  audio: FileAudio,
  video: Video,
  code: Code2,
  archive: Archive,
  "file-code": FileCode,
  "git-branch": GitBranch,
  "scan-text": ScanText,
  table: Table2,
};

export function getIcon(name: string): ComponentType<{ className?: string }> {
  return iconMap[name] ?? Wrench;
}
