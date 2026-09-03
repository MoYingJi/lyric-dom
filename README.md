# lyric-dom

A framework-agnostic karaoke-style lyrics renderer for the browser. Built on the native DOM API with zero runtime dependencies.

## Installation

```bash
npm install lyric-dom
```

## Usage

```ts
import { LyricRenderer, applyScrollPreroll } from "lyric-dom";
import "lyric-dom/renderer.css";

const container = document.querySelector<HTMLDivElement>("#lyrics")!;

const renderer = new LyricRenderer(container, {
  playing: true,
  alignPosition: 0.35,
  onLineClick: (timeMs) => player.seek(timeMs),
});

// Provide lyric lines (timestamps in milliseconds); applyScrollPreroll is optional
renderer.setLyrics(applyScrollPreroll(lines));

// Push the current playback time every frame (or from a high-frequency timer)
renderer.setCurrentTime(player.currentTime);

// Playback state
renderer.setPlaying(true);

// Release resources
renderer.dispose();
```

Styling is customized through CSS variables, all of which have defaults:

```css
#lyrics {
  --lp-color: #fff;
  --lp-padding-x: 1em;
  --lp-sub-opacity: 0.3;
  --lp-dot-size: 0.45em;
}
```

## API

### `LyricRenderer`

| Method | Description |
| --- | --- |
| `setLyrics(lines)` | Set the lyric lines to render |
| `setCurrentTime(timeMs)` | Push the current playback time (milliseconds) |
| `setPlaying(playing)` | Play / pause |
| `setConfig(config)` | Update configuration (any subset of the constructor options) |
| `freeze()` / `resume()` | Suspend / resume rendering (for hidden windows) |
| `getBottomLineElement()` | Get the container below the last line (for credits, etc.) |
| `dispose()` | Destroy the renderer and clean up the DOM |

### Types

```ts
interface LyricLine {
  language?: LyricLanguage; // "ja" | "ko" | "zh-CN" | "und-Latn"
  words: LyricWord[];
  translatedLyric: string;
  romanLyric: string;
  startTime: number; // ms
  endTime: number; // ms
  isBG: boolean;
  isDuet: boolean;
}

interface LyricWord extends LyricSpan {
  romanWord?: string;
  obscene?: boolean;
  ruby?: LyricSpan[];
}

interface LyricSpan {
  startTime: number; // ms
  endTime: number; // ms
  word: string;
}
```

All renderer options are described by the exported `RendererConfig` type. `applyScrollPreroll(lines)` shifts line start times slightly earlier so the view scrolls into place before each line begins.
