import type { Terminal } from "xterm";

const help = (
  terminal: Terminal,
  commands: Record<string, string>,
  aliases?: Record<string, string[]>
): void => {
  Object.entries(commands).forEach(([command, description]) => {
    terminal?.writeln(`${command.padEnd(14)} ${description}`);
  });

  if (aliases) {
    terminal?.writeln("");
    terminal?.writeln("Aliases:");
    Object.entries(aliases).forEach(([baseCommand, aliasCommands]) => {
      aliasCommands.forEach((aliasCommand) => {
        terminal?.writeln(
          `${aliasCommand.padEnd(14)} ${commands[baseCommand]}`
        );
      });
    });
  }
};

export default help;
