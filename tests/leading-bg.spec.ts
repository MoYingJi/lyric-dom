import { describe, expect, it } from "vitest";
import { LyricRenderer } from "../src";
import type { LyricLine } from "../src/types";

const createLine = (startTime: number, text: string, isBG = false): LyricLine => ({
  words: [{ startTime, endTime: startTime + 2000, word: text }],
  translatedLyric: "",
  romanLyric: "",
  startTime,
  endTime: startTime + 2000,
  isBG,
  isDuet: false,
});

describe("首行背景行渲染", () => {
  it("背景行落在数组首位时降级为主行渲染，不产生元素空洞", () => {
    const lines = [
      createLine(500, "首行和声", true),
      createLine(2000, "主歌词第一句"),
      createLine(6000, "主歌词第二句"),
    ];

    const container = document.createElement("div");
    Object.defineProperty(container, "clientWidth", { value: 800 });
    Object.defineProperty(container, "clientHeight", { value: 600 });
    document.body.appendChild(container);

    const renderer = new LyricRenderer(container);
    expect(() => renderer.setLyrics(lines)).not.toThrow();
    expect(renderer.getBottomLineElement()).toBeDefined();

    // 首行降级为主行，按主行样式类渲染且可见
    const firstLine = container.querySelector(".lp-inner > .lp-line");
    expect(firstLine?.textContent).toContain("首行和声");

    // 推进时间与帧循环不再因空洞抛错
    renderer.setCurrentTime(700);
    renderer.dispose();
    container.remove();
  });

  it("连续背景行折叠后依旧无空洞", () => {
    const lines = [
      createLine(500, "和声A", true),
      createLine(600, "和声B", true),
      createLine(2000, "主歌词"),
    ];

    const container = document.createElement("div");
    Object.defineProperty(container, "clientWidth", { value: 800 });
    Object.defineProperty(container, "clientHeight", { value: 600 });
    document.body.appendChild(container);

    const renderer = new LyricRenderer(container);
    expect(() => renderer.setLyrics(lines)).not.toThrow();
    expect(container.querySelectorAll(".lp-inner > .lp-line").length).toBe(3);

    renderer.dispose();
    container.remove();
  });
});
