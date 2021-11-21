import type { FSModule } from "browserfs/dist/node/core/FS";
import type { MessageCallback, ProgressCallback } from "isomorphic-git";
import { join } from "path";
import type { Terminal } from "xterm";

const corsProxy = "https://cors.isomorphic-git.org";

const processGit = async (
  [command, ...args]: string[],
  cd: string,
  terminal: Terminal,
  fs: FSModule,
  exists: (path: string) => Promise<boolean>,
  updateFolder: (folder: string, newFile?: string, oldFile?: string) => void
): Promise<void> => {
  const { checkout, clone, version } = await import("isomorphic-git");
  const events: string[] = [];
  const onMessage: MessageCallback = (message) =>
    terminal.writeln(`remote: ${message.trim()}`);
  const onProgress: ProgressCallback = ({ phase }): void => {
    if (events[events.length - 1] !== phase) {
      terminal.writeln(phase);
      events.push(phase);
    }
  };
  const options = {
    fs,
    onProgress,
  };

  terminal?.writeln("");

  switch (command) {
    case "clone": {
      const http = await import("isomorphic-git/http/node");
      const [url] = args;
      const dirName = url.split("/").pop();
      const dir = dirName ? join(cd, dirName) : cd;

      try {
        terminal?.writeln(`Cloning into '${dirName}'...`);

        await clone({ ...options, corsProxy, dir, http, onMessage, url });
      } catch (error) {
        terminal.writeln((error as Error).message);
      }
      break;
    }
    case "checkout": {
      if (await exists(join(cd, ".git"))) {
        const [ref] = args;

        try {
          await checkout({ ...options, dir: cd, force: true, ref });

          terminal?.writeln(`Switched to branch '${ref}'`);
        } catch (error) {
          terminal.writeln((error as Error).message);
        }
      } else {
        terminal.writeln("fatal: not a git repository: .git");
      }
      break;
    }
    case "version": {
      terminal.writeln(`git version ${version()}.isomorphic-git`);
      break;
    }
    case "help":
    default:
      console.log("git help");
  }

  updateFolder(cd);
};

export default processGit;
