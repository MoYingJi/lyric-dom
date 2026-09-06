import { DEFAULTS } from "../src";
import type { ControlDef } from "./panel";

export interface DemoState extends Record<string, unknown> {
  alignPosition: number;
  wordFadeWidth: number;
  enableWordHighlight: boolean;
  minInterludeGap: number;
  breatheCycleTarget: number;
  alphaAttackSpeed: number;
  alphaReleaseSpeed: number;
  inactiveAlpha: number;
  hidePassedLines: boolean;
  enableBlur: boolean;
  enableFloatAnimation: boolean;
  enableEmphasizeEffect: boolean;
  showTranslation: boolean;
  showRomanization: boolean;
  scrollResetDelay: number;
  "spring.mass": number;
  "spring.damping": number;
  "spring.stiffness": number;
  "spring.soft": boolean;
}

export const createInitialState = (): DemoState => ({
  alignPosition: DEFAULTS.alignPosition,
  wordFadeWidth: DEFAULTS.wordFadeWidth,
  enableWordHighlight: DEFAULTS.enableWordHighlight,
  minInterludeGap: DEFAULTS.minInterludeGap,
  breatheCycleTarget: DEFAULTS.breatheCycleTarget,
  alphaAttackSpeed: DEFAULTS.alphaAttackSpeed,
  alphaReleaseSpeed: DEFAULTS.alphaReleaseSpeed,
  inactiveAlpha: DEFAULTS.inactiveAlpha,
  hidePassedLines: DEFAULTS.hidePassedLines,
  enableBlur: DEFAULTS.enableBlur,
  enableFloatAnimation: DEFAULTS.enableFloatAnimation,
  enableEmphasizeEffect: DEFAULTS.enableEmphasizeEffect,
  showTranslation: DEFAULTS.showTranslation,
  showRomanization: DEFAULTS.showRomanization,
  scrollResetDelay: DEFAULTS.scrollResetDelay,
  "spring.mass": 1,
  "spring.damping": 10,
  "spring.stiffness": 100,
  "spring.soft": false,
});

export const REBUILD_KEYS = new Set([
  "enableFloatAnimation",
  "enableEmphasizeEffect",
  "showTranslation",
  "showRomanization",
]);

export const CONTROL_DEFS: ControlDef<DemoState>[] = [
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
  { key: "enableEmphasizeEffect", label: "强调辉光", type: "toggle" },
  { key: "showTranslation", label: "显示翻译", type: "toggle" },
  { key: "showRomanization", label: "显示音译", type: "toggle" },
  { type: "group", label: "交互" },
  { key: "scrollResetDelay", label: "滚动回弹延迟", type: "range", min: 0, max: 15000, step: 500 },
  { type: "group", label: "弹簧参数" },
  { key: "spring.mass", label: "质量", type: "range", min: 0.1, max: 5, step: 0.1 },
  { key: "spring.damping", label: "阻尼", type: "range", min: 1, max: 60, step: 1 },
  { key: "spring.stiffness", label: "刚度", type: "range", min: 10, max: 500, step: 5 },
  { key: "spring.soft", label: "过阻尼(soft)", type: "toggle" },
];
