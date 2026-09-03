import { LyricRenderer, applyScrollPreroll } from "../src";
import { DEMO_LYRICS, TOTAL_DURATION } from "./lyrics";
import { buildPanel, type ControlDef } from "./panel";
import "../src/renderer.css";
import "./style.css";

const container = document.getElementById("lyrics-container") as HTMLDivElement;

/** 虚拟播放时钟 */
const clock = { current: 0, playing: false, rate: 1 };

const renderer = new LyricRenderer(container, {
  playing: false,
  onLineClick: (timeMs) => {
    clock.current = timeMs;
    renderer.setCurrentTime(timeMs);
  },
});
renderer.setLyrics(applyScrollPreroll(DEMO_LYRICS));
renderer.getBottomLineElement().textContent = "lyric-dom demo";

// ---- 播放控制 ----

const playBtn = document.getElementById("play-btn") as HTMLButtonElement;
const timeSlider = document.getElementById("time-slider") as HTMLInputElement;
const timeLabel = document.getElementById("time-label") as HTMLElement;
const rateSelect = document.getElementById("rate-select") as HTMLSelectElement;

playBtn.addEventListener("click", () => {
  clock.playing = !clock.playing;
  playBtn.textContent = clock.playing ? "暂停" : "播放";
  renderer.setPlaying(clock.playing);
});

timeSlider.max = String(TOTAL_DURATION);
timeSlider.addEventListener("input", () => {
  clock.current = Number.parseFloat(timeSlider.value);
  renderer.setCurrentTime(clock.current);
});

rateSelect.addEventListener("change", () => {
  clock.rate = Number.parseFloat(rateSelect.value);
});

const formatTime = (ms: number) =>
  `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

let lastTimestamp = 0;
const tick = (timestamp: number) => {
  const delta = lastTimestamp ? timestamp - lastTimestamp : 16;
  lastTimestamp = timestamp;
  if (clock.playing) {
    clock.current += delta * clock.rate;
    if (clock.current >= TOTAL_DURATION) clock.current = 0;
  }
  renderer.setCurrentTime(clock.current);
  if (document.activeElement !== timeSlider) {
    timeSlider.value = String(Math.round(clock.current));
  }
  timeLabel.textContent = `${formatTime(clock.current)} / ${formatTime(TOTAL_DURATION)}`;
  requestAnimationFrame(tick);
};
requestAnimationFrame(tick);

// ---- 配置面板 ----

const state: Record<string, any> = {
  alignPosition: 0.35,
  wordFadeWidth: 0.5,
  scrollResetDelay: 5000,
  minInterludeGap: 4000,
  breatheCycleTarget: 1500,
  alphaAttackSpeed: 50,
  alphaReleaseSpeed: 7,
  inactiveAlpha: 0.2,
  hidePassedLines: false,
  enableBlur: false,
  enableWordHighlight: true,
  enableFloatAnimation: false,
  enableEmphasizeEffect: false,
  showTranslation: true,
  showRomanization: true,
  "spring.mass": 1,
  "spring.damping": 10,
  "spring.stiffness": 100,
  "spring.soft": false,
};

/** 变更后需要重建歌词 DOM 的配置（影响 span 结构或副歌词行） */
const REBUILD_KEYS = new Set([
  "enableFloatAnimation",
  "enableEmphasizeEffect",
  "showTranslation",
  "showRomanization",
]);

const defs: ControlDef[] = [
  { type: "group", label: "布局" },
  { key: "alignPosition", label: "对齐位置", type: "range", min: 0, max: 1, step: 0.01 },
  { type: "group", label: "逐字高亮" },
  { key: "wordFadeWidth", label: "渐变宽度", type: "range", min: 0, max: 1, step: 0.01 },
  { key: "enableWordHighlight", label: "逐字高亮", type: "toggle" },
  { type: "group", label: "间奏圆点" },
  { key: "minInterludeGap", label: "最小间隔", type: "range", min: 0, max: 10000, step: 500 },
  { key: "breatheCycleTarget", label: "呼吸周期", type: "range", min: 500, max: 4000, step: 100 },
  { type: "group", label: "透明度" },
  { key: "alphaAttackSpeed", label: "激活速度", type: "range", min: 5, max: 200, step: 5 },
  { key: "alphaReleaseSpeed", label: "衰减速度", type: "range", min: 1, max: 50, step: 1 },
  { key: "inactiveAlpha", label: "非激活透明度", type: "range", min: 0.05, max: 1, step: 0.05 },
  { key: "hidePassedLines", label: "隐藏已播行", type: "toggle" },
  { type: "group", label: "效果" },
  { key: "enableBlur", label: "逐行模糊", type: "toggle" },
  { key: "enableFloatAnimation", label: "逐字上浮", type: "toggle" },
  { key: "enableEmphasizeEffect", label: "强调（辉光）", type: "toggle" },
  { key: "showTranslation", label: "翻译", type: "toggle" },
  { key: "showRomanization", label: "音译", type: "toggle" },
  { type: "group", label: "交互" },
  { key: "scrollResetDelay", label: "滚动回弹延迟", type: "range", min: 0, max: 15000, step: 500 },
  { type: "group", label: "弹簧参数" },
  { key: "spring.mass", label: "质量", type: "range", min: 0.1, max: 5, step: 0.1 },
  { key: "spring.damping", label: "阻尼", type: "range", min: 1, max: 60, step: 1 },
  { key: "spring.stiffness", label: "刚度", type: "range", min: 10, max: 500, step: 5 },
  { key: "spring.soft", label: "过阻尼（soft）", type: "toggle" },
];

const handlePanelChange = (key: string) => {
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
  if (REBUILD_KEYS.has(key)) renderer.setLyrics(applyScrollPreroll(DEMO_LYRICS));
};

buildPanel(document.getElementById("controls") as HTMLElement, state, defs, handlePanelChange);
