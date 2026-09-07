import { describe, expect, it } from "vitest";
import { LyricRenderer } from "../src";
import type { LyricLine } from "../src/types";

describe("Word Romanization (逐字音译) 与互斥/回退机制", () => {
  it("开启逐字音译且歌词包含 romanWord 时，优先渲染逐字音译并隐藏行音译", () => {
    const container = document.createElement("div");
    const renderer = new LyricRenderer(container, {
      showRomanization: true,
      showWordRomanization: true,
    });

    const lines: LyricLine[] = [
      {
        startTime: 1000,
        endTime: 3000,
        words: [
          { startTime: 1000, endTime: 2000, word: "私", romanWord: "watashi" },
          { startTime: 2000, endTime: 3000, word: "は", romanWord: "wa" },
        ],
        translatedLyric: "我是",
        romanLyric: "watashi wa",
        isBG: false,
        isDuet: false,
      },
    ];

    renderer.setLyrics(lines);

    // 检查是否渲染了逐字音译 DOM
    const romanWords = container.querySelectorAll(".lp-roman-word");
    expect(romanWords.length).toBe(2);
    expect(romanWords[0].textContent).toBe("watashi");
    expect(romanWords[1].textContent).toBe("wa");

    // 检查行音译是否被抑制（只应有翻译行）
    const subLines = container.querySelectorAll(".lp-sub");
    expect(subLines.length).toBe(1);
    expect(subLines[0].textContent).toBe("我是");

    renderer.dispose();
  });

  it("关闭逐字音译开关后，有逐字音译的行回退为展示行音译", () => {
    const container = document.createElement("div");
    const renderer = new LyricRenderer(container, {
      showRomanization: true,
      showWordRomanization: false,
    });

    const lines: LyricLine[] = [
      {
        startTime: 1000,
        endTime: 3000,
        words: [
          { startTime: 1000, endTime: 2000, word: "私", romanWord: "watashi" },
          { startTime: 2000, endTime: 3000, word: "は", romanWord: "wa" },
        ],
        translatedLyric: "我是",
        romanLyric: "watashi wa",
        isBG: false,
        isDuet: false,
      },
    ];

    renderer.setLyrics(lines);

    // 逐字音译不应渲染
    const romanWords = container.querySelectorAll(".lp-roman-word");
    expect(romanWords.length).toBe(0);

    // 行音译正常回退显示（翻译 + 行音译共 2 个 lp-sub）
    const subLines = container.querySelectorAll(".lp-sub");
    expect(subLines.length).toBe(2);
    expect(subLines[0].textContent).toBe("我是");
    expect(subLines[1].textContent).toBe("watashi wa");

    renderer.dispose();
  });

  it("当歌词仅有行音译而无逐字音译时，开启逐字音译开关行音译绝不消失", () => {
    const container = document.createElement("div");
    const renderer = new LyricRenderer(container, {
      showRomanization: true,
      showWordRomanization: true,
    });

    const lines: LyricLine[] = [
      {
        startTime: 1000,
        endTime: 3000,
        words: [
          { startTime: 1000, endTime: 2000, word: "Hello" },
          { startTime: 2000, endTime: 3000, word: "world" },
        ],
        translatedLyric: "你好世界",
        romanLyric: "hello world romanized",
        isBG: false,
        isDuet: false,
      },
    ];

    renderer.setLyrics(lines);

    // 无逐字音译
    const romanWords = container.querySelectorAll(".lp-roman-word");
    expect(romanWords.length).toBe(0);

    // 行音译正常显示
    const subLines = container.querySelectorAll(".lp-sub");
    expect(subLines.length).toBe(2);
    expect(subLines[0].textContent).toBe("你好世界");
    expect(subLines[1].textContent).toBe("hello world romanized");

    renderer.dispose();
  });

  it("逐字音译模式下缺失音译的词使用不换行空格占位以平齐基线", () => {
    const container = document.createElement("div");
    const renderer = new LyricRenderer(container, {
      showRomanization: true,
      showWordRomanization: true,
    });

    const lines: LyricLine[] = [
      {
        startTime: 1000,
        endTime: 3000,
        words: [
          { startTime: 1000, endTime: 1500, word: "君", romanWord: "kimi" },
          { startTime: 1500, endTime: 2000, word: "、" }, // 标点符号，无 romanWord
          { startTime: 2000, endTime: 3000, word: "待つ", romanWord: "matsu" },
        ],
        translatedLyric: "",
        romanLyric: "kimi, matsu",
        isBG: false,
        isDuet: false,
      },
    ];

    renderer.setLyrics(lines);

    const romanWords = container.querySelectorAll(".lp-roman-word");
    expect(romanWords.length).toBe(3);
    expect(romanWords[0].textContent).toBe("kimi");
    // 标点占位符为 \u00A0
    expect(romanWords[1].textContent).toBe("\u00A0");
    expect(romanWords[2].textContent).toBe("matsu");

    renderer.dispose();
  });

  it("支持 ruby 注音与逐字音译同时开启的复合结构", () => {
    const container = document.createElement("div");
    const renderer = new LyricRenderer(container, {
      showRuby: true,
      showWordRomanization: true,
    });

    const lines: LyricLine[] = [
      {
        startTime: 1000,
        endTime: 3000,
        words: [
          {
            startTime: 1000,
            endTime: 2000,
            word: "明日",
            ruby: [
              { startTime: 1000, endTime: 1500, word: "あ" },
              { startTime: 1500, endTime: 2000, word: "す" },
            ],
            romanWord: "asu",
          },
        ],
        translatedLyric: "",
        romanLyric: "asu",
        isBG: false,
        isDuet: false,
      },
    ];

    renderer.setLyrics(lines);

    const rubyEl = container.querySelector("ruby");
    expect(rubyEl).not.toBeNull();
    const rtElements = container.querySelectorAll("rt");
    expect(rtElements.length).toBe(2);

    const romanEl = container.querySelector(".lp-roman-word");
    expect(romanEl).not.toBeNull();
    expect(romanEl?.textContent).toBe("asu");

    renderer.dispose();
  });

  it("通过 setConfig 动态切换 showWordRomanization 实时生效", () => {
    const container = document.createElement("div");
    const renderer = new LyricRenderer(container, {
      showRomanization: true,
      showWordRomanization: true,
    });

    const lines: LyricLine[] = [
      {
        startTime: 1000,
        endTime: 3000,
        words: [
          { startTime: 1000, endTime: 2000, word: "花", romanWord: "hana" },
          { startTime: 2000, endTime: 3000, word: "火", romanWord: "bi" },
        ],
        translatedLyric: "烟花",
        romanLyric: "hanabi",
        isBG: false,
        isDuet: false,
      },
    ];

    renderer.setLyrics(lines);
    expect(container.querySelectorAll(".lp-roman-word").length).toBe(2);
    expect(container.querySelectorAll(".lp-sub").length).toBe(1); // 仅翻译

    // 动态关闭逐字音译
    renderer.setConfig({ showWordRomanization: false });
    expect(container.querySelectorAll(".lp-roman-word").length).toBe(0);
    expect(container.querySelectorAll(".lp-sub").length).toBe(2); // 翻译 + 行音译

    // 动态恢复逐字音译
    renderer.setConfig({ showWordRomanization: true });
    expect(container.querySelectorAll(".lp-roman-word").length).toBe(2);
    expect(container.querySelectorAll(".lp-sub").length).toBe(1); // 仅翻译

    renderer.dispose();
  });

  it("默认配置下逐字音译为关闭状态，优先展示行音译", () => {
    const container = document.createElement("div");
    const renderer = new LyricRenderer(container);

    const lines: LyricLine[] = [
      {
        startTime: 1000,
        endTime: 3000,
        words: [
          { startTime: 1000, endTime: 2000, word: "星", romanWord: "hoshi" },
          { startTime: 2000, endTime: 3000, word: "空", romanWord: "zora" },
        ],
        translatedLyric: "星空",
        romanLyric: "hoshizora",
        isBG: false,
        isDuet: false,
      },
    ];

    renderer.setLyrics(lines);
    // 默认关闭，逐字音译不渲染
    expect(container.querySelectorAll(".lp-roman-word").length).toBe(0);
    // 默认展示行音译
    const subLines = container.querySelectorAll(".lp-sub");
    expect(subLines.length).toBe(2);
    expect(subLines[1].textContent).toBe("hoshizora");

    renderer.dispose();
  });
});
