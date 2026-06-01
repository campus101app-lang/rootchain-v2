import type { Decimal } from "@prisma/client/runtime/library";

export function dec(v: Decimal | number | string): number {
  return Number(v.toString());
}

export function decStr(v: Decimal | number | string): string {
  return v.toString();
}
