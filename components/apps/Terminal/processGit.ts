import type { FSModule } from "browserfs/dist/node/core/FS";
import { help } from "components/apps/Terminal/functions";
import type { LocalEcho } from "components/apps/Terminal/types";
import type { MessageCallback, ProgressCallback } from "isomorphic-git";
import { join } from "path";

const corsProxy = "https://cors.isomorphic-git.org";

export const commands: Record<string, string> = {
  checkout: "Switch branches or restore working tree files",
  clone: "Clone a repository into a new directory",
};

const processGit = async (
  [command, ...args]: string[],
  cd: string,
  localEcho: LocalEcho,
  fs: FSModule,
  exists: (path: string) => Promise<boolean>,
  updateFolder: (folder: string, newFile?: string, oldFile?: string) => void
): Promise<void> => {
  const { checkout, clone, version } = await import("isomorphic-git");
  const events: string[] = [];
  const onMessage: MessageCallback = (message) =>
    localEcho.println(`remote: ${message.trim()}`);
  const onProgress: ProgressCallback = ({ phase }): void => {
    if (events[events.length - 1] !== phase) {
      localEcho.println(phase);
      events.push(phase);
    }
  };
  const options = {
    fs,
    onProgress,
  };

  switch (command) {
    case "clone": {
      const http = await import("isomorphic-git/http/web");
      const [url] = args;
      const dirName = url
        ?.split("/")
        .pop()
        ?.replace(/\.git$/, "");
      const dir = dirName ? join(cd, dirName) : cd;

      try {
        if (dirName) localEcho.println(`Cloning into '${dirName}'...`);

        await clone({ ...options, corsProxy, dir, http, onMessage, url });
      } catch (error) {
        localEcho.println((error as Error).message);
      }
      break;
    }
    case "checkout": {
      if (await exists(join(cd, ".git"))) {
        const [ref] = args;

        try {
          await checkout({ ...options, dir: cd, force: true, ref });

          localEcho.println(`Switched to branch '${ref}'`);
        } catch (error) {
          localEcho.println((error as Error).message);
        }
      } else {
        localEcho.println("fatal: not a git repository: .git");
      }
      break;
    }
    case "version": {
      localEcho.println(`git version ${version()}.isomorphic-git`);
      break;
    }
    case "help":
    default:
      help(localEcho, commands);
  }

  updateFolder(cd);
};

export default processGit;
