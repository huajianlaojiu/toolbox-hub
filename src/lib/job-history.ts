import { JOB_HISTORY_KEY } from "@/lib/billing";

export type JobRecord = {
  id: string;
  tool: string;
  summary: string;
  at: string;
};

const MAX_JOBS = 20;
const EMPTY_JOBS: JobRecord[] = [];
let jobsCache: JobRecord[] = EMPTY_JOBS;
let jobsRaw: string | null = null;

function parseJobs(raw: string | null): JobRecord[] {
  if (!raw) return EMPTY_JOBS;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY_JOBS;
    const jobs = parsed.filter(
      (item): item is JobRecord =>
        !!item &&
        typeof item === "object" &&
        typeof (item as JobRecord).id === "string" &&
        typeof (item as JobRecord).tool === "string" &&
        typeof (item as JobRecord).summary === "string" &&
        typeof (item as JobRecord).at === "string"
    );
    return jobs.length === 0 ? EMPTY_JOBS : jobs;
  } catch {
    return EMPTY_JOBS;
  }
}

function readRaw(): JobRecord[] {
  if (typeof localStorage === "undefined") return EMPTY_JOBS;
  const raw = localStorage.getItem(JOB_HISTORY_KEY);
  if (raw === jobsRaw) return jobsCache;
  jobsRaw = raw;
  jobsCache = parseJobs(raw);
  return jobsCache;
}

export function subscribeJobs(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === JOB_HISTORY_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("tbh-jobs-change", onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("tbh-jobs-change", onChange);
  };
}

export function getJobsServerSnapshot(): JobRecord[] {
  return EMPTY_JOBS;
}

/** 只记工具名、时间和一句摘要。不记文件名或文件内容。 */
export function recordJob(tool: string, summary: string) {
  if (typeof localStorage === "undefined") return;
  const next: JobRecord = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    tool,
    summary,
    at: new Date().toISOString(),
  };
  const jobs = [next, ...readRaw()].slice(0, MAX_JOBS);
  localStorage.setItem(JOB_HISTORY_KEY, JSON.stringify(jobs));
  window.dispatchEvent(new Event("tbh-jobs-change"));
}

export function listJobs(): JobRecord[] {
  return readRaw();
}

export function exportJobsJson(): string {
  return JSON.stringify({ exportedAt: new Date().toISOString(), jobs: readRaw() }, null, 2);
}
