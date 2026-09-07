import { parseLyric } from "lyric-kit";
import { describe, expect, it } from "vitest";
import { applyScrollPreroll, LyricRenderer } from "../src";

describe("lyric-kit compatibility", () => {
  it("parses LRC with lyric-kit and renders in lyric-dom", () => {
    const lrc = `
[ti:Test Title]
[ar:Test Artist]
[00:01.00]Hello world
[00:03.00]Second line
[00:05.50]Third line
    `.trim();

    const result = parseLyric(lrc, { extractMetadata: true });
    expect(result.lines.length).toBe(3);
    expect(result.metadata.title?.[0]).toBe("Test Title");

    const container = document.createElement("div");
    Object.defineProperty(container, "clientWidth", { value: 800 });
    Object.defineProperty(container, "clientHeight", { value: 600 });
    document.body.appendChild(container);

    const renderer = new LyricRenderer(container);
    const prerolled = applyScrollPreroll(result.lines);
    renderer.setLyrics(prerolled);

    expect(renderer.getBottomLineElement()).toBeDefined();
    renderer.dispose();
    container.remove();
  });

  it("handles word-by-word lyrics with endsWithSpace from lyric-kit", () => {
    const elrc = `
[00:01.00]<00:01.00>Never <00:01.40>gonna <00:01.80>give <00:02.20>you <00:02.60>up
[00:04.00]<00:04.00>Never <00:04.40>gonna <00:04.80>let <00:05.20>you <00:05.60>down
    `.trim();

    const result = parseLyric(elrc);
    expect(result.lines.length).toBe(2);
    expect(result.lines[0].words.length).toBeGreaterThan(1);
    expect(result.lines[0].words[0].endsWithSpace).toBe(true);

    const container = document.createElement("div");
    Object.defineProperty(container, "clientWidth", { value: 800 });
    Object.defineProperty(container, "clientHeight", { value: 600 });
    document.body.appendChild(container);

    const renderer = new LyricRenderer(container);
    renderer.setLyrics(applyScrollPreroll(result.lines));
    renderer.setCurrentTime(1500);

    renderer.dispose();
    container.remove();
  });

  it("supports simultaneous overlapping lines (multi-line singing)", () => {
    const lines = [
      {
        startTime: 1000,
        endTime: 4000,
        isBG: false,
        isDuet: false,
        translatedLyric: "",
        romanLyric: "",
        words: [{ word: "Singer 1", startTime: 1000, endTime: 4000 }],
      },
      {
        startTime: 2000,
        endTime: 5000,
        isBG: false,
        isDuet: true,
        translatedLyric: "",
        romanLyric: "",
        words: [{ word: "Singer 2", startTime: 2000, endTime: 5000 }],
      },
      {
        startTime: 2500,
        endTime: 4500,
        isBG: true,
        isDuet: false,
        translatedLyric: "",
        romanLyric: "",
        words: [{ word: "Harmony", startTime: 2500, endTime: 4500 }],
      },
    ];

    const container = document.createElement("div");
    Object.defineProperty(container, "clientWidth", { value: 800 });
    Object.defineProperty(container, "clientHeight", { value: 600 });
    document.body.appendChild(container);

    const renderer = new LyricRenderer(container);
    renderer.setCurrentTime(3000);
    renderer.setLyrics(lines);

    const activeLines = container.querySelectorAll(".lp-line.active");
    expect(activeLines.length).toBe(3);

    renderer.dispose();
    container.remove();
  });

  it("allows toggling and configuring scroll preroll optimization", () => {
    const lines = [
      {
        startTime: 2000,
        endTime: 4000,
        isBG: false,
        isDuet: false,
        translatedLyric: "",
        romanLyric: "",
        words: [{ word: "Line 1", startTime: 2000, endTime: 4000 }],
      },
      {
        startTime: 6000,
        endTime: 8000,
        isBG: false,
        isDuet: false,
        translatedLyric: "",
        romanLyric: "",
        words: [{ word: "Line 2", startTime: 6000, endTime: 8000 }],
      },
    ];

    const container = document.createElement("div");
    Object.defineProperty(container, "clientWidth", { value: 800 });
    Object.defineProperty(container, "clientHeight", { value: 600 });
    document.body.appendChild(container);

    // 默认启用预滚：Line 2 应当提前 600ms (从 6000ms 提前至 5400ms)
    const rendererDefault = new LyricRenderer(container);
    rendererDefault.setLyrics(lines);
    const internalLinesDefault = (rendererDefault as unknown as { lines: typeof lines }).lines;
    expect(internalLinesDefault[1].startTime).toBe(5400);
    rendererDefault.dispose();

    // 禁用预滚：保持原始 6000ms
    const rendererDisabled = new LyricRenderer(container, { enableScrollPreroll: false });
    rendererDisabled.setLyrics(lines);
    const internalLinesDisabled = (rendererDisabled as unknown as { lines: typeof lines }).lines;
    expect(internalLinesDisabled[1].startTime).toBe(6000);
    rendererDisabled.dispose();

    // 自定义预滚提前量
    const rendererCustom = new LyricRenderer(container, {
      scrollPrerollOptions: { advanceNoOverlap: 800 },
    });
    rendererCustom.setLyrics(lines);
    const internalLinesCustom = (rendererCustom as unknown as { lines: typeof lines }).lines;
    expect(internalLinesCustom[1].startTime).toBe(5200);
    rendererCustom.dispose();

    container.remove();
  });

  it("keeps background line active when main line finishes earlier", () => {
    const lines = [
      {
        startTime: 1000,
        endTime: 3000,
        isBG: false,
        isDuet: false,
        translatedLyric: "",
        romanLyric: "",
        words: [{ word: "Main line ends early", startTime: 1000, endTime: 3000 }],
      },
      {
        startTime: 1500,
        endTime: 5000,
        isBG: true,
        isDuet: false,
        translatedLyric: "",
        romanLyric: "",
        words: [{ word: "Background harmony lasts longer", startTime: 1500, endTime: 5000 }],
      },
      {
        startTime: 7000,
        endTime: 9000,
        isBG: false,
        isDuet: false,
        translatedLyric: "",
        romanLyric: "",
        words: [{ word: "Next line", startTime: 7000, endTime: 9000 }],
      },
    ];

    const container = document.createElement("div");
    Object.defineProperty(container, "clientWidth", { value: 800 });
    Object.defineProperty(container, "clientHeight", { value: 600 });
    document.body.appendChild(container);

    const renderer = new LyricRenderer(container, { enableScrollPreroll: false });
    const engine = renderer as unknown as { processTime: (t: number) => boolean };
    renderer.setCurrentTime(2000);
    renderer.setLyrics(lines);

    // 在 2000ms 时，主行与背景行均在演唱中，两者都应激活
    const activeAt2000 = container.querySelectorAll(".lp-line.active");
    expect(activeAt2000.length).toBe(2);

    // 在 4000ms 时，主行（3000ms）已唱完，但背景行（5000ms）仍在演唱中
    // 背景行绝不能被连带杀死，必须依然保持 active 状态
    engine.processTime(4000);
    const lineElements = container.querySelectorAll(".lp-line");
    expect(lineElements[1].classList.contains("active")).toBe(true);

    // 在 5500ms 时，两者均已唱完，均应退出 active 状态
    engine.processTime(5500);
    const activeAt5500 = container.querySelectorAll(".lp-line.active");
    expect(activeAt5500.length).toBe(0);

    // Seek 直接跳转到 4000ms（主行已过但背景行正在演唱）
    engine.processTime(4000);
    expect(lineElements[1].classList.contains("active")).toBe(true);

    renderer.dispose();
    container.remove();
  });
});
