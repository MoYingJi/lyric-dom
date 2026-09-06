/**
 * lyric-dom 类型系统定义
 *
 * 与 lyric-kit 统一规范看齐，提供歌词数据模型、弹簧动力学、滚动与性能优化、渲染配置等完整声明
 */

/**
 * 歌词行语言代码
 * - "ja": 日语
 * - "ko": 韩语
 * - "zh-CN": 简体中文
 * - "und-Latn": 语言未知的拉丁文字
 */
export type LyricLanguage = "ja" | "ko" | "zh-CN" | "und-Latn";

/**
 * 歌词时间片段（基础跨度）
 */
export interface LyricSpan {
  /**
   * 起始时间（毫秒）
   * @example 12500
   */
  startTime: number;
  /**
   * 结束时间（毫秒）
   * @example 14200
   */
  endTime: number;
  /**
   * 文本内容
   * @example "Hello"
   */
  word: string;
}

/**
 * 歌词单词（逐字/音节片段）
 */
export interface LyricWord extends LyricSpan {
  /**
   * 音译内容（如罗马音、汉语拼音）
   * @example "konnichiwa"
   */
  romanWord?: string;
  /**
   * 是否包含不雅用语
   * @default false
   */
  obscene?: boolean;
  /**
   * 注音列表（如日语假名、拼音标注）
   */
  ruby?: LyricSpan[];
  /**
   * 该音节结尾是否紧跟空格（用于西文排版与卡拉OK分词间距控制）
   * @default false
   */
  endsWithSpace?: boolean;
  /**
   * 空拍数量（用于前奏/间奏打拍动效）
   * @default 0
   */
  emptyBeat?: number;
}

/**
 * 一行歌词
 */
export interface LyricLine {
  /**
   * 行唯一标识符，如 "L1", "L2"
   */
  id?: string;
  /**
   * 主歌词语言代码，用于排版与 HTML lang 属性设置
   */
  language?: LyricLanguage;
  /**
   * 该行的单词/音节序列
   */
  words: LyricWord[];
  /**
   * 该行的翻译歌词文本，显示在主歌词行下方
   */
  translatedLyric: string;
  /**
   * 该行的音译歌词文本，显示在翻译歌词行下方
   */
  romanLyric: string;
  /**
   * 该句起始时间（毫秒）
   */
  startTime: number;
  /**
   * 该句结束时间（毫秒）
   */
  endTime: number;
  /**
   * 是否为背景伴唱/和声行
   * @default false
   */
  isBG: boolean;
  /**
   * 是否为对唱歌词行（开启时右对齐排版）
   * @default false
   */
  isDuet: boolean;
  /**
   * 演唱者 ID，如 "v1", "v2"
   */
  agentId?: string;
  /**
   * 歌曲结构段落标签（如 "Intro", "Verse", "Chorus", "Bridge", "Outro"）
   */
  songPart?: string;
  /**
   * 所属结构块索引
   */
  blockIndex?: number;
}

/**
 * 弹簧物理参数配置
 *
 * 基于阻尼谐振子（Damped Harmonic Oscillator）数学模型，
 * 通过质量、阻尼系数与刚度控制视口滚动与缩放运动。
 */
export interface SpringParams {
  /**
   * 物体质量 (mass)
   * 值越大惯性越大，加速更缓慢，振荡周期更长。
   * @default 1
   */
  mass: number;
  /**
   * 阻尼系数 (damping)
   * 决定振荡能量耗散快慢。
   * @default 10
   */
  damping: number;
  /**
   * 刚度系数 (stiffness)
   * 回弹力强度。值越大到达目标速度越快，频率越高。
   * @default 100
   */
  stiffness: number;
  /**
   * 是否强制启用过阻尼模式 (soft)
   * 为 true 时强制单调指数衰减，无任何振荡与回弹。
   * @default false
   */
  soft: boolean;
}

/**
 * 滚动预滚（提前滚动）优化配置
 *
 * 在歌词句子实际开唱前平滑提前启动视口滚动，
 * 避免开唱瞬间视口突跳，呈现自然的预先对焦视野效果。
 */
export interface ScrollPrerollOptions {
  /**
   * 与前一行无重叠时间隔时的提前量（毫秒）
   * @default 600
   */
  advanceNoOverlap: number;
  /**
   * 与前一行存在时间重叠（如对唱）时的提前量（毫秒）
   * @default 400
   */
  advanceOverlap: number;
  /**
   * 时间重叠时的提前边界比例（取前一行时长的比例位置，范围 0~1）
   * 避免提前越过还在演唱中的上一个声部。
   * @default 0.3
   */
  overlapBoundaryRatio: number;
}

/**
 * 歌词行点击回调函数
 * @param timeMs - 点击行的起始时间（毫秒）
 */
export type LineClickCallback = (timeMs: number) => void;

/**
 * 渲染器全局配置选项
 */
export interface RendererConfig {
  /**
   * 激活行在视口中的垂直居中锚定比例（0~1）
   * 0 表示靠顶，0.5 表示正中，0.35 表示黄金偏上位置
   * @default 0.35
   */
  alignPosition: number;
  /**
   * 播放状态
   * @default false
   */
  playing: boolean;
  /**
   * 自定义弹簧动力学参数（覆盖默认质量、阻尼与刚度）
   */
  springConfig: Partial<SpringParams>;
  /**
   * 逐字高亮渐变遮罩的边缘过渡宽度比例（0~1）
   * @default 0.5
   */
  wordFadeWidth: number;
  /**
   * 用户手动滚动/拖拽后，自动恢复跟随当前播放进度的延迟时间（毫秒）
   * @default 5000
   */
  scrollResetDelay: number;
  /**
   * 触发前奏/间奏圆点等待动效的最小间隔时长（毫秒）
   * @default 4000
   */
  minInterludeGap: number;
  /**
   * 间奏圆点呼吸跳动动画的目标周期（毫秒）
   * @default 1500
   */
  breatheCycleTarget: number;
  /**
   * 行激活时透明度提升响应速度（数值越大越迅速）
   * @default 50
   */
  alphaAttackSpeed: number;
  /**
   * 行离开时透明度衰减响应速度（数值越大越平缓）
   * @default 7
   */
  alphaReleaseSpeed: number;
  /**
   * 非激活行（未唱到/已唱过）的基础透明度（0~1）
   * @default 0.2
   */
  inactiveAlpha: number;
  /**
   * 是否隐藏已经播放完毕的历史行
   * @default false
   */
  hidePassedLines: boolean;
  /**
   * 是否启用距离视口边缘的逐行动态高斯模糊
   * @default false
   */
  enableBlur: boolean;
  /**
   * 是否启用逐字卡拉OK流光高亮渲染
   * @default true
   */
  enableWordHighlight: boolean;
  /**
   * 是否启用逐字微妙上浮位移动画
   * @default false
   */
  enableFloatAnimation: boolean;
  /**
   * 是否启用长音节强调动效（缩放 + 辉光 + 逐字波浪浮动）
   * @default false
   */
  enableEmphasizeEffect: boolean;
  /**
   * 判定长音节强调动画的最小持续时间阈值（毫秒）
   * @default 1000
   */
  emphasizeMinDuration: number;
  /**
   * 是否在主歌词行下方渲染翻译歌词
   * @default true
   */
  showTranslation: boolean;
  /**
   * 是否在翻译行下方渲染音译歌词
   * @default true
   */
  showRomanization: boolean;
  /**
   * 是否启用滚动预滚优化算法（提前平滑将下一行滚入视野中央）
   * @default true
   */
  enableScrollPreroll: boolean;
  /**
   * 滚动预滚算法的微调参数
   */
  scrollPrerollOptions: Partial<ScrollPrerollOptions>;
  /**
   * 识别用户跳转播放进度（seek）的后退时间阈值（毫秒）
   * @default 100
   */
  seekBackwardThreshold: number;
  /**
   * 识别用户跳转播放进度（seek）的前进时间阈值（毫秒）
   * @default 2000
   */
  seekForwardThreshold: number;
  /**
   * 歌词行点击回调函数，传入该行的起始毫秒数
   */
  onLineClick?: LineClickCallback;
}

/**
 * 单个单词 DOM 元素的尺寸度量数据（用于渐变遮罩定位）
 */
export interface WordMeasurement {
  /** 对应的 HTML span 元素 */
  element: HTMLSpanElement;
  /** 关联的单词数据 */
  word: LyricWord;
  /** 元素渲染宽度（像素） */
  width: number;
  /** 遮罩渐变区域宽度（像素） */
  fadeWidth: number;
}

/**
 * 单词动画渲染目标描述（供 Web Animations API 延迟创建）
 */
export interface WordAnimTarget {
  /** 挂载位移动画的 DOM 元素 */
  element: HTMLElement;
  /** 单词数据 */
  word: LyricWord;
  /** 是否达到强调效果触发条件 */
  isEmphasize: boolean;
  /** 强调效果下的拆分字符元素序列 */
  charElements: HTMLElement[];
  /** 是否为该行最后一个有效单词 */
  isLastWord: boolean;
}
