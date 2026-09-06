/**
 * 演示播放器（真实 HTML5 Audio）
 */
export class DemoPlayer {
  private audio: HTMLAudioElement;
  private currentAudioUrl: string | null = null;
  private onStateChange?: (playing: boolean) => void;

  constructor(audioEl: HTMLAudioElement, onStateChange?: (playing: boolean) => void) {
    this.audio = audioEl;
    this.onStateChange = onStateChange;

    this.audio.addEventListener("play", () => this.onStateChange?.(true));
    this.audio.addEventListener("pause", () => this.onStateChange?.(false));
    this.audio.addEventListener("ended", () => this.onStateChange?.(false));
  }

  loadAudio(file: File): void {
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
    }
    this.currentAudioUrl = URL.createObjectURL(file);
    this.audio.src = this.currentAudioUrl;
    this.audio.load();
    this.onStateChange?.(false);
  }

  hasAudio(): boolean {
    return this.currentAudioUrl !== null;
  }

  getIsPlaying(): boolean {
    return !this.audio.paused && !this.audio.ended && this.audio.readyState > 0;
  }

  getCurrentTime(): number {
    return this.audio.currentTime * 1000;
  }

  getDuration(): number {
    return Number.isFinite(this.audio.duration) ? this.audio.duration * 1000 : 0;
  }

  async play(): Promise<void> {
    if (!this.hasAudio()) return;
    try {
      await this.audio.play();
    } catch {
      // 捕获浏览器可能的自动播放限制
    }
  }

  pause(): void {
    if (!this.hasAudio()) return;
    this.audio.pause();
  }

  togglePlay(): void {
    if (!this.hasAudio()) return;
    if (this.audio.paused) {
      void this.play();
    } else {
      this.pause();
    }
  }

  seek(timeMs: number): void {
    if (!this.hasAudio()) return;
    const dur = this.getDuration();
    const clamped = Math.max(0, Math.min(timeMs, dur > 0 ? dur : timeMs));
    this.audio.currentTime = clamped / 1000;
  }

  setPlaybackRate(rate: number): void {
    this.audio.playbackRate = rate;
  }

  setVolume(vol: number): void {
    this.audio.volume = vol;
  }
}
