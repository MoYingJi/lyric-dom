import type { LyricLine } from "../types";

/**
 * 同步主行与紧随背景行的时间窗口
 * 背景行依附于主行，两者共享生命周期窗口（取两者的最宽时间范围并集）
 * @param lines - 歌词行数组
 * @returns 规范化后的歌词行数组
 */
export const syncMainAndBackgroundLines = (lines: LyricLine[]): LyricLine[] => {
  for (let lineIdx = lines.length - 1; lineIdx >= 0; lineIdx--) {
    const line = lines[lineIdx];
    if (line.isBG) continue;

    const bg = lines[lineIdx + 1];
    if (!bg?.isBG) continue;

    let minStart = Math.min(line.startTime, bg.startTime);
    let maxEnd = Math.max(line.endTime, bg.endTime);

    const allWords = [...line.words, ...bg.words].filter((word) => word.word.trim().length > 0);
    for (const word of allWords) {
      if (word.startTime < minStart) minStart = word.startTime;
      if (word.endTime > maxEnd) maxEnd = word.endTime;
    }

    line.startTime = bg.startTime = minStart;
    line.endTime = bg.endTime = maxEnd;
  }

  return lines;
};
