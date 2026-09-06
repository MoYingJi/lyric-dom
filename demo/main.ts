import { LyricRenderer } from "../src";
import type { LyricLine } from "../src/types";
import { CONTROL_DEFS, createInitialState, type DemoState, REBUILD_KEYS } from "./config";
import { parseLyricFile } from "./importer";
import { buildPanel } from "./panel";
import { DemoPlayer } from "./player";
import "../src/renderer.css";
import "./style.css";

// ---- DOM 元素 ----
const container = document.getElementById("lyrics-container") as HTMLDivElement;
const emptyPlaceholder = document.getElementById("empty-placeholder") as HTMLDivElement;
const audio = document.getElementById("audio") as HTMLAudioElement;
const playBtn = document.getElementById("play-btn") as HTMLButtonElement;
const timeLabel = document.getElementById("time-label") as HTMLSpanElement;
const timeSlider = document.getElementById("time-slider") as HTMLInputElement;
const rateSelect = document.getElementById("rate-select") as HTMLSelectElement;
const volumeSlider = document.getElementById("volume-slider") as HTMLInputElement;

const audioFileInput = document.getElementById("audio-file") as HTMLInputElement;
const lyricFileInput = document.getElementById("lyric-file") as HTMLInputElement;
const audioInfo = document.getElementById("audio-info") as HTMLSpanElement;
const lyricInfo = document.getElementById("lyric-info") as HTMLSpanElement;

// ---- 状态与引擎 ----
const state: DemoState = createInitialState();
let currentLines: LyricLine[] = [];
let isDraggingSlider = false;

const formatTime = (ms: number): string => {
  const safe = Math.max(0, ms);
  const sec = Math.floor(safe / 1000);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
};

const player = new DemoPlayer(audio, (playing) => {
  playBtn.textContent = playing ? "暂停" : "播放";
  renderer.setPlaying(playing);
});

const renderer = new LyricRenderer(container, {
  playing: false,
  alignPosition: state.alignPosition,
  wordFadeWidth: state.wordFadeWidth,
  enableWordHighlight: state.enableWordHighlight,
  minInterludeGap: state.minInterludeGap,
  breatheCycleTarget: state.breatheCycleTarget,
  alphaAttackSpeed: state.alphaAttackSpeed,
  alphaReleaseSpeed: state.alphaReleaseSpeed,
  inactiveAlpha: state.inactiveAlpha,
  hidePassedLines: state.hidePassedLines,
  enableBlur: state.enableBlur,
  enableFloatAnimation: state.enableFloatAnimation,
  enableEmphasizeEffect: state.enableEmphasizeEffect,
  emphasizeMinDuration: state.emphasizeMinDuration,
  showTranslation: state.showTranslation,
  showRomanization: state.showRomanization,
  enableScrollPreroll: state.enableScrollPreroll,
  scrollResetDelay: state.scrollResetDelay,
  seekForwardThreshold: state.seekForwardThreshold,
  onLineClick: (timeMs) => {
    if (player.hasAudio()) {
      player.seek(timeMs);
      if (!player.getIsPlaying()) void player.play();
    } else {
      renderer.setCurrentTime(timeMs);
    }
  },
});

// ---- 播放控制条事件 ----
playBtn.addEventListener("click", () => {
  player.togglePlay();
});

rateSelect.addEventListener("change", () => {
  player.setPlaybackRate(Number.parseFloat(rateSelect.value));
});

volumeSlider.addEventListener("input", () => {
  player.setVolume(Number.parseFloat(volumeSlider.value));
});

timeSlider.addEventListener("mousedown", () => {
  isDraggingSlider = true;
});

timeSlider.addEventListener(
  "touchstart",
  () => {
    isDraggingSlider = true;
  },
  { passive: true },
);

timeSlider.addEventListener("input", () => {
  const val = Number.parseFloat(timeSlider.value);
  timeLabel.textContent = `${formatTime(val)} / ${formatTime(player.getDuration())}`;
});

timeSlider.addEventListener("change", () => {
  isDraggingSlider = false;
  player.seek(Number.parseFloat(timeSlider.value));
});

// ---- 音频元数据监听 ----
audio.addEventListener("loadedmetadata", () => {
  const dur = player.getDuration();
  timeSlider.max = String(Math.round(dur));
  timeLabel.textContent = `0:00 / ${formatTime(dur)}`;
});

// ---- 媒体文件导入 ----
audioFileInput.addEventListener("change", () => {
  const file = audioFileInput.files?.[0];
  if (!file) return;
  player.loadAudio(file);
  playBtn.disabled = false;
  timeSlider.disabled = false;
  audioInfo.textContent = `音频：${file.name}`;
});

lyricFileInput.addEventListener("change", async () => {
  const file = lyricFileInput.files?.[0];
  if (!file) return;
  try {
    const loaded = await parseLyricFile(file);
    currentLines = loaded.lines;
    renderer.setLyrics(loaded.lines);
    emptyPlaceholder.style.display = "none";
    lyricInfo.textContent = `歌词：${loaded.title} (${loaded.lines.length} 行)`;
  } catch (err) {
    alert(`歌词解析失败: ${String(err)}`);
  }
});

// ---- 动画帧时钟循环 ----
const onFrame = () => {
  if (player.hasAudio()) {
    const current = player.getCurrentTime();
    const duration = player.getDuration();
    renderer.setCurrentTime(current);

    if (!isDraggingSlider) {
      if (duration > 0) {
        timeSlider.max = String(Math.round(duration));
      }
      timeSlider.value = String(Math.round(current));
      timeLabel.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    }
  }

  requestAnimationFrame(onFrame);
};

requestAnimationFrame(onFrame);

// ---- 参数控制面板 ----
const handlePanelChange = (key: keyof DemoState & string) => {
  if (key.startsWith("spring.")) {
    renderer.setConfig({
      springConfig: {
        mass: state["spring.mass"],
        damping: state["spring.damping"],
        stiffness: state["spring.stiffness"],
        soft: state["spring.soft"],
      },
    });
    return;
  }
  renderer.setConfig({ [key]: state[key] });
  if (REBUILD_KEYS.has(key) && currentLines.length > 0) {
    renderer.setLyrics(currentLines);
  }
};

buildPanel(
  document.getElementById("controls") as HTMLElement,
  state,
  CONTROL_DEFS,
  handlePanelChange,
);
