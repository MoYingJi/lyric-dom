export { LyricRenderer } from "./engine";
export { DEFAULTS } from "./engine/constants";
export type {
  LineClickCallback,
  LyricLanguage,
  LyricLine,
  LyricSpan,
  LyricWord,
  RendererConfig,
  ScrollPrerollOptions,
  SpringParams,
  WordAnimTarget,
  WordMeasurement,
} from "./types";
export { syncMainAndBackgroundLines } from "./utils/normalize";
export { applyScrollPreroll } from "./utils/scroll-preroll";
