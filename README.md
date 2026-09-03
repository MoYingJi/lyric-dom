# lyric-dom

框架无关的 Apple Music 风格逐字歌词渲染引擎，基于原生 DOM 实现，不依赖任何 UI 框架。

## 特性

- 逐字高亮（CSS mask 位移，零 reflow 的读写分离测量）
- 弹簧物理滚动（阻尼振荡器求解器，级联波浪入场）
- 对唱（duet）左右分栏、背景人声（BG）行、翻译 / 音译副歌词
- 间奏呼吸圆点、逐行模糊、逐字上浮与强调（辉光）动画
- 视口裁剪 + 合成层按需提升（`will-change` 仅挂在视口附近的行），长歌词 / 长时间播放内存稳定
- 用户手动滚动（滚轮 / 触摸）后自动回弹到激活行

## 安装

```bash
npm install lyric-dom
```

## 使用

```ts
import { LyricRenderer, applyScrollPreroll } from "lyric-dom";
import "lyric-dom/renderer.css";

const container = document.querySelector<HTMLDivElement>("#lyrics")!;

const renderer = new LyricRenderer(container, {
  playing: true,
  alignPosition: 0.35,
  onLineClick: (timeMs) => player.seek(timeMs),
});

// 歌词行数组（毫秒时间轴）；applyScrollPreroll 可选，提前滚动预滚
renderer.setLyrics(applyScrollPreroll(lines));

// 每帧（或高频定时器）推送当前播放时间，驱动滚动与逐字高亮
renderer.setCurrentTime(player.currentTime);

// 播放状态
renderer.setPlaying(true);

// 释放
renderer.dispose();
```

样式通过 CSS 变量定制，全部带默认值：

```css
#lyrics {
  --lp-color: #fff;
  --lp-padding-x: 1em;
  --lp-sub-opacity: 0.3;
  --lp-dot-size: 0.45em;
}
```

## API

`LyricRenderer` 实例方法：

| 方法 | 说明 |
| --- | --- |
| `setLyrics(lines)` | 设置歌词行数据 |
| `setCurrentTime(timeMs)` | 推送当前播放时间（毫秒） |
| `setPlaying(playing)` | 播放 / 暂停 |
| `setConfig(config)` | 更新配置（同构造参数的部分字段） |
| `freeze()` / `resume()` | 挂起 / 恢复渲染（隐藏窗口时用） |
| `getBottomLineElement()` | 取末行下方容器（放制作者信息等自定义内容） |
| `dispose()` | 销毁并清理 DOM |

完整配置项见 `RendererConfig` 类型导出；工具函数 `applyScrollPreroll` 用于滚动预滚。

## 说明

渲染思路与 [AMLL](https://github.com/amll-dev/applemusic-like-lyrics) 同源，在其基础上为长歌词场景做了性能特化（批量读写分离、视口裁剪、按需合成层）。弹簧求解器来自 [pushkine](https://github.com/pushkine/)（MIT）。

## 开发

```bash
pnpm install
pnpm build    # tsup → dist
pnpm test     # vitest（happy-dom）
```
