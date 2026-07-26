import chalk from "chalk";

const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export class Spinner {
  private interval: NodeJS.Timeout | null = null;
  private startTime = 0;
  private frameIndex = 0;
  start(message: string): void {
    this.startTime = Date.now();
    this.interval = setInterval(() => {
      const frame = frames[this.frameIndex % frames.length];
      process.stdout.write(`\r${frame} ${message}`);
      this.frameIndex++;
    }, 80);
  }
  stop(label?: string): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const msg = label ? `✓ ${label} (${elapsed}s)` : `✓ Done (${elapsed}s)`;
    process.stdout.write(`\r${msg}\n`);
  }
}
