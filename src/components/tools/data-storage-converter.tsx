// @ts-nocheck
"use client";
import UnitConverter from "@/components/shared/unit-converter";

export default function DataStorageConverter() {
  const units = {
    byte: { name: "Bytes (B)", toBase: (v: number) => v, fromBase: (v: number) => v },
    kb: { name: "Kilobytes (KB)", toBase: (v: number) => v * 1024, fromBase: (v: number) => v / 1024 },
    mb: { name: "Megabytes (MB)", toBase: (v: number) => v * 1048576, fromBase: (v: number) => v / 1048576 },
    gb: { name: "Gigabytes (GB)", toBase: (v: number) => v * 1073741824, fromBase: (v: number) => v / 1073741824 },
    tb: { name: "Terabytes (TB)", toBase: (v: number) => v * 1099511627776, fromBase: (v: number) => v / 1099511627776 },
    pb: { name: "Petabytes (PB)", toBase: (v: number) => v * 1.125899906842624e15, fromBase: (v: number) => v / 1.125899906842624e15 },
    bit: { name: "Bits", toBase: (v: number) => v / 8, fromBase: (v: number) => v * 8 },
    kbit: { name: "Kilobits", toBase: (v: number) => v * 128, fromBase: (v: number) => v / 128 },
    mbit: { name: "Megabits", toBase: (v: number) => v * 131072, fromBase: (v: number) => v / 131072 },
  };
  return <UnitConverter units={units} defaultFrom="mb" defaultTo="gb" />;
}