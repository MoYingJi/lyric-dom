import type { LyricLine, ScrollPrerollOptions } from "../types";

/** 默认滚动预滚参数 */
export const DEFAULT_SCROLL_PREROLL_OPTIONS: Required<ScrollPrerollOptions> = {
  advanceNoOverlap: 600,
  advanceOverlap: 400,
  overlapBoundaryRatio: 0.3,
};

/**
 * 滚动预滚：提前行开始时间，让滚动渲染器在开唱前先把视野滚到位
 *
 * 判定一律基于各行的原始时间（修改不影响后续行的判定）。
 * 相互重叠的连续主行（对唱段）合并为组，无重叠行的提前边界取组的最晚结束时间，
 * 避免把行提前进还在演唱中的对唱组。
 *
 * @param sourceLines - 规范化后的歌词行数组
 * @param options - 自定义提前量与重叠比例参数
 * @returns 应用预滚后的克隆行数组
 */
export const applyScrollPreroll = (
  sourceLines: readonly LyricLine[],
  options?: Partial<ScrollPrerollOptions>,
): LyricLine[] => {
  const advanceNoOverlap =
    options?.advanceNoOverlap ?? DEFAULT_SCROLL_PREROLL_OPTIONS.advanceNoOverlap;
  const advanceOverlap = options?.advanceOverlap ?? DEFAULT_SCROLL_PREROLL_OPTIONS.advanceOverlap;
  const overlapBoundaryRatio =
    options?.overlapBoundaryRatio ?? DEFAULT_SCROLL_PREROLL_OPTIONS.overlapBoundaryRatio;

  const lines = sourceLines.map((line) => ({ ...line }));

  let prevLineStartTime = 0;
  let prevLineEndTime = 0;
  let prevGroupStartTime = 0;
  let prevGroupEndTime = 0;
  let hasPrevLine = false;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    if (line.isBG) continue;

    const originalStartTime = line.startTime;
    const originalEndTime = line.endTime;

    let advance: number;
    let boundary: number;

    if (hasPrevLine) {
      const hadGap = originalStartTime >= prevLineEndTime;
      if (hadGap) {
        advance = advanceNoOverlap;
        boundary = prevGroupEndTime;
      } else {
        advance = advanceOverlap;
        boundary = prevLineStartTime + (prevLineEndTime - prevLineStartTime) * overlapBoundaryRatio;
      }
    } else {
      advance = advanceNoOverlap;
      boundary = 0;
    }

    const newStart = Math.max(boundary, originalStartTime - advance);
    if (newStart < line.startTime) line.startTime = newStart;

    // 配对背景行随主行一起提前
    const bg = lines[lineIdx + 1];
    if (bg?.isBG) bg.startTime = line.startTime;

    // 更新重叠组：与上一组时间相交则并入，否则另起一组
    if (
      hasPrevLine &&
      originalStartTime < prevGroupEndTime &&
      originalEndTime > prevGroupStartTime
    ) {
      prevGroupStartTime = Math.min(prevGroupStartTime, originalStartTime);
      prevGroupEndTime = Math.max(prevGroupEndTime, originalEndTime);
    } else {
      prevGroupStartTime = originalStartTime;
      prevGroupEndTime = originalEndTime;
    }

    prevLineStartTime = originalStartTime;
    prevLineEndTime = originalEndTime;
    hasPrevLine = true;
  }

  return lines;
};
