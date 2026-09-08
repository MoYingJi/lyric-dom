import { parseLyric } from "lyric-kit";
import { describe, expect, it } from "vitest";
import { applyScrollPreroll, LyricRenderer } from "../src";

describe("lyric-kit 格式兼容性", () => {
  it("解析标准 LRC 并在渲染器中正确挂载渲染", () => {
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

  it("正确处理逐字歌词中词尾带空格（endsWithSpace）的场景", () => {
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

  it("支持重叠行多歌手同时演唱的多行激活", () => {
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

  it("支持开启、关闭以及自定义滚动预滚优化参数", () => {
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

  it("主行提前结束演唱时，背景行仍保持激活直至自身结束", () => {
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

    // 在 2000ms 时，两者均在演唱中，两者都激活
    const activeAt2000 = container.querySelectorAll(".lp-line.active");
    expect(activeAt2000.length).toBe(2);

    // 在 4000ms 时，主行（3000ms）已结束，但背景行（5000ms）仍在演唱中，主行与背景行均保持 active 亮起
    engine.processTime(4000);
    const lineElements = container.querySelectorAll(".lp-line:not(.lp-credit)");
    expect(lineElements[0].classList.contains("active")).toBe(true);
    expect(lineElements[1].classList.contains("active")).toBe(true);

    // 在 5500ms 时，两者均已结束，均退出 active
    engine.processTime(5500);
    const activeAt5500 = container.querySelectorAll(".lp-line:not(.lp-credit).active");
    expect(activeAt5500.length).toBe(0);

    // Seek 直接跳转到 4000ms（主行已过但背景行正在演唱，两者均保持 active）
    engine.processTime(4000);
    expect(lineElements[0].classList.contains("active")).toBe(true);
    expect(lineElements[1].classList.contains("active")).toBe(true);

    renderer.dispose();
    container.remove();
  });

  it("顶部背景行早于主行演唱时，到时独立激活出现", () => {
    const lines = [
      {
        startTime: 4000,
        endTime: 8000,
        isBG: false,
        isDuet: false,
        translatedLyric: "",
        romanLyric: "",
        words: [{ word: "Main line starts late", startTime: 4000, endTime: 8000 }],
      },
      {
        startTime: 2000,
        endTime: 6000,
        isBG: true,
        isDuet: false,
        translatedLyric: "",
        romanLyric: "",
        words: [{ word: "Top background starts early", startTime: 2000, endTime: 6000 }],
      },
    ];

    const container = document.createElement("div");
    Object.defineProperty(container, "clientWidth", { value: 800 });
    Object.defineProperty(container, "clientHeight", { value: 600 });
    document.body.appendChild(container);

    const renderer = new LyricRenderer(container, { enableScrollPreroll: false });
    const engine = renderer as unknown as { processTime: (t: number) => boolean };
    renderer.setCurrentTime(0);
    renderer.setLyrics(lines);

    const lineElements = container.querySelectorAll(".lp-line:not(.lp-credit)");

    // 在 2500ms 时，主行（4000ms）未到歌词时间，但顶部背景行（2000ms）已开唱，顶部背景行与主行对唱组激活出现
    engine.processTime(2500);
    expect(lineElements[1].classList.contains("active")).toBe(true);
    expect(lineElements[0].classList.contains("active")).toBe(true);

    // 在 5000ms 时，主行与背景行均在演唱中，两者都激活
    engine.processTime(5000);
    expect(lineElements[0].classList.contains("active")).toBe(true);
    expect(lineElements[1].classList.contains("active")).toBe(true);

    // 在 9000ms 时，两者均已唱完退出 active
    engine.processTime(9000);
    expect(lineElements[0].classList.contains("active")).toBe(false);
    expect(lineElements[1].classList.contains("active")).toBe(false);

    renderer.dispose();
    container.remove();
  });

  it("加载歌词时自动对齐主行与背景行的时间窗口", () => {
    const lines = [
      {
        startTime: 3000,
        endTime: 6000,
        isBG: false,
        isDuet: false,
        translatedLyric: "",
        romanLyric: "",
        words: [{ word: "主行", startTime: 3000, endTime: 6000 }],
      },
      {
        startTime: 2000,
        endTime: 7000,
        isBG: true,
        isDuet: false,
        translatedLyric: "",
        romanLyric: "",
        words: [{ word: "背景行", startTime: 2000, endTime: 7000 }],
      },
    ];

    const container = document.createElement("div");
    Object.defineProperty(container, "clientWidth", { value: 800 });
    Object.defineProperty(container, "clientHeight", { value: 600 });
    document.body.appendChild(container);

    const renderer = new LyricRenderer(container, { enableScrollPreroll: false });
    renderer.setLyrics(lines);

    const internalLines = (renderer as unknown as { lines: typeof lines }).lines;
    // 主行与背景行时间窗口应当合并对齐到两者的最宽范围（2000ms ~ 7000ms）
    expect(internalLines[0].startTime).toBe(2000);
    expect(internalLines[0].endTime).toBe(7000);
    expect(internalLines[1].startTime).toBe(2000);
    expect(internalLines[1].endTime).toBe(7000);

    renderer.dispose();
    container.remove();
  });
});
