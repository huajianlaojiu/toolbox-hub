"use client";

import { useSyncExternalStore } from "react";
import { getProServerSnapshot, getProSnapshot, subscribePro } from "@/lib/pro-storage";

export function usePro(): boolean {
  return useSyncExternalStore(subscribePro, getProSnapshot, getProServerSnapshot);
}
