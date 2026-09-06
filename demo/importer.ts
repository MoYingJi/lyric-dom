import { parseLyric } from "lyric-kit";
import type { LyricLine } from "../src/types";

export interface LoadedLyric {
  lines: LyricLine[];
  title: string;
}

export const parseLyricFile = async (file: File): Promise<LoadedLyric> => {
  const text = await file.text();
  const result = parseLyric(text, {
    extractMetadata: true,
    cleanKangxi: true,
    applyOffset: true,
  });
  const title = result.metadata.title?.[0] || file.name;
  return { lines: result.lines, title };
};
