import type { Terminal } from "xterm";

const commands: Record<string, string> = {
  cd: "Displays the name of or changes the current directory.",
  clear: "Clears the screen.",
  date: "Displays the date.",
  dir: "Displays list of files and directories in a directory.",
  echo: "Displays messages that are passed to it as arguments.",
  exit: "Quits the command interpreter.",
  git: "Read from git repositories.",
  help: "Provides Help information for commands.",
  history: "Displays command history list.",
  license: "Displays license.",
  pwd: "Prints the working directory.",
  shutdown: "Allows proper local shutdown of machine.",
  taskkill: "Kill or stop a running process or application.",
  tasklist: "Displays all currently running processes.",
  time: "Displays the system time.",
  title: "Sets the window title for the command interpreter.",
  type: "Displays the contents of a file.",
  uptime: "Display the current uptime of the local system.",
  ver: "Displays the system version.",
  wapm: "Run universal Wasm binaries.",
  whoami: "Displays user information.",
};

const aliases: Record<string, string[]> = {
  cd: ["chdir"],
  clear: ["cls"],
  dir: ["ls"],
  exit: ["quit"],
  shutdown: ["reboot", "restart"],
  taskkill: ["kill"],
  tasklist: ["ps"],
  type: ["cat"],
  ver: ["version"],
  wapm: ["wax"],
};

const help = (commandArgs: string[], terminal: Terminal): void => {
  terminal?.writeln("");
  Object.entries(commands).forEach(([command, description]) => {
    terminal?.writeln(`${command.padEnd(14)} ${description}`);
  });
  terminal?.writeln("");
  terminal?.writeln("Aliases:");
  Object.entries(aliases).forEach(([baseCommand, aliasCommands]) => {
    aliasCommands.forEach((aliasCommand) => {
      terminal?.writeln(`${aliasCommand.padEnd(14)} ${commands[baseCommand]}`);
    });
  });
};

export default help;
