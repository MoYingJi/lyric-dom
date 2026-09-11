import { beforeEach, describe, expect, it, vi } from "vitest";
import { LyricRenderer } from "../src";
import type { LyricLine } from "../src/types";

let frameTime = 0;

const createContainer = () => {
  const container = document.createElement("div");
  Object.defineProperty(container, "clientWidth", { value: 800 });
  Object.defineProperty(container, "clientHeight", { value: 600 });
  document.body.appendChild(container);
  return container;
};

const createLine = (words: LyricLine["words"]): LyricLine => ({
  startTime: 1000,
  endTime: 4000,
  words,
  translatedLyric: "",
  romanLyric: "",
  isBG: false,
  isDuet: false,
});

const stepRenderer = (renderer: LyricRenderer, playTime: number) => {
  frameTime += 16;
  renderer.setCurrentTime(playTime);
  const engine = renderer as unknown as {
    onAnimationFrame: (timestamp: number) => void;
  };
  engine.onAnimationFrame(frameTime);
};

const getBrightAlpha = (renderer: LyricRenderer) => {
  const engine = renderer as unknown as { alphaValues: Float64Array };
  return engine.alphaValues[0];
};

describe("非逐字歌词行高亮", () => {
  beforeEach(() => {
    frameTime = 0;
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn(() => 1),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );
  });

  it("标准 LRC 激活时使用柔和的行级淡入", () => {
    const container = createContainer();
    const renderer = new LyricRenderer(container, { enableScrollPreroll: false });
    renderer.setLyrics([createLine([{ word: "整行歌词", startTime: 1000, endTime: 4000 }])]);

    stepRenderer(renderer, 900);
    stepRenderer(renderer, 1000);

    expect(getBrightAlpha(renderer)).toBeGreaterThan(0.2);
    expect(getBrightAlpha(renderer)).toBeLessThan(0.3);

    renderer.dispose();
    container.remove();
  });

  it("逐字歌词激活时仍保持快速响应", () => {
    const container = createContainer();
    const renderer = new LyricRenderer(container, { enableScrollPreroll: false });
    renderer.setLyrics([
      createLine([
        { word: "逐字", startTime: 1000, endTime: 2500 },
        { word: "歌词", startTime: 2500, endTime: 4000 },
      ]),
    ]);

    stepRenderer(renderer, 900);
    stepRenderer(renderer, 1000);

    expect(getBrightAlpha(renderer)).toBeGreaterThan(0.35);

    renderer.dispose();
    container.remove();
  });
});
