import { diffLines } from "diff";
import chalk from "chalk";

/**
 * Print a colorized unified diff between two strings.
 * Added lines are green, removed lines are red.
 */
export function printDiff(oldContent: string, newContent: string): void {
  const changes = diffLines(oldContent, newContent);

  for (const change of changes) {
    if (change.added) {
      process.stdout.write(chalk.green(change.value));
    } else if (change.removed) {
      process.stdout.write(chalk.red(change.value));
    } else {
      process.stdout.write(change.value);
    }
  }
}