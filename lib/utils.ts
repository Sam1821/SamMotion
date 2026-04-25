// shadcn classname helper — minimal version, no extra deps required.
export function cn(...inputs: Array<string | undefined | null | false>): string {
  return inputs.filter(Boolean).join(" ")
}
