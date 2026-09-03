import type { LyricLine, LyricWord } from "../src/types";

/** 将行时长均分给各段文本 */
const spread = (start: number, duration: number, texts: string[]): LyricWord[] => {
  const per = duration / texts.length;
  return texts.map((text, index) => ({
    word: text,
    startTime: start + index * per,
    endTime: start + (index + 1) * per,
  }));
};

const mk = (
  start: number,
  duration: number,
  words: LyricWord[],
  extra?: Partial<LyricLine>,
): LyricLine => ({
  words,
  translatedLyric: "",
  romanLyric: "",
  startTime: start,
  endTime: start + duration,
  isBG: false,
  isDuet: false,
  language: "zh-CN",
  ...extra,
});

/** 覆盖引擎主要特性的样例歌词：间奏、对唱、背景人声、翻译、音译、长音强调 */
export const DEMO_LYRICS: LyricLine[] = [
  mk(6000, 3800, spread(6000, 3800, ["夜色", "温柔", "漫过", "街口"]), {
    translatedLyric: "The night gently flows over the street corner",
  }),
  mk(10000, 4200, spread(10000, 4200, ["灯火", "在雨里", "缓缓", "沉没"]), {
    translatedLyric: "The lights slowly sink in the rain",
  }),
  mk(14600, 4400, spread(14600, 4400, ["你", "说过的", "话", "像风"]), {
    translatedLyric: "What you said drifts like the wind",
  }),
  // 背景人声行
  mk(19400, 4400, spread(19400, 4400, ["我在", "人海里", "独自", "漂流"]), {
    translatedLyric: "I drift alone in the crowd",
  }),
  mk(19800, 4000, spread(19800, 4000, ["独自漂流"]), { isBG: true }),
  // 约 6s 间奏，触发呼吸圆点
  mk(30000, 4200, spread(30000, 4200, ["你从", "雨中", "走来"]), {
    isDuet: true,
    translatedLyric: "You came through the rain",
  }),
  mk(34600, 4400, spread(34600, 4400, ["我在", "灯下", "等待"]), {
    translatedLyric: "I waited under the light",
  }),
  mk(39400, 4600, spread(39400, 4600, ["故事", "缓缓", "展开"]), {
    isDuet: true,
    translatedLyric: "The story slowly unfolds",
  }),
  mk(44600, 4600, spread(44600, 4600, ["时间", "停在", "那个", "夏天"]), {
    romanLyric: "shí jiān tíng zài nà ge xià tiān",
  }),
  mk(50000, 4600, spread(50000, 4600, ["回忆", "依旧", "鲜艳"]), {
    romanLyric: "huí yì yī jiù xiān yàn",
  }),
  // 长音单词（≥1000ms 触发强调动画）
  mk(
    55200,
    7400,
    [
      { word: "最后", startTime: 55200, endTime: 56800 },
      { word: "的", startTime: 56800, endTime: 57400 },
      { word: "声——", startTime: 57400, endTime: 62600 },
    ],
    {
      translatedLyric: "The last note lingers",
    },
  ),
  mk(63000, 5000, spread(63000, 5000, ["尾音", "停在", "唇边"]), {
    translatedLyric: "and rests on the lips",
  }),
];

export const TOTAL_DURATION = Math.max(...DEMO_LYRICS.map((line) => line.endTime)) + 3000;
