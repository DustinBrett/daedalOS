import type { FSModule } from "browserfs/dist/node/core/FS";
import { help } from "components/apps/Terminal/functions";
import type { LocalEcho } from "components/apps/Terminal/types";
import type { MessageCallback, ProgressCallback } from "isomorphic-git";
import { join } from "path";

// If you need to use a proxy, this is it:
// const corsProxy = "https://cors.isomorphic-git.org";

export const commands: Record<string, string> = {
  add: "Add file contents to the index",
  checkout: "Switch branches or restore working tree files",
  clone: "Clone a repository into a new directory",
  commit: "Record changes to the repository",
  status: "Show the working tree status",
  version: "Show the version",
};

const processGit = async (
  [command, ...args]: string[],
  cd: string,
  localEcho: LocalEcho,
  fs: FSModule,
  exists: (path: string) => Promise<boolean>,
  updateFolder: (folder: string, newFile?: string, oldFile?: string) => void
): Promise<void> => {
  const { add, checkout, clone, commit, push, statusMatrix, version } =
    await import("isomorphic-git");
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
    case "push": {
      const http = await import("isomorphic-git/http/web");
      const [url] = args;

      const dirName = url
        ?.split("/")
        .pop()
        ?.replace(/\.git$/, "");
      const dir = dirName ? join(cd, dirName) : cd;
      localEcho.println(`status started: ${dir}`);

      try {
        await push({
          dir,
          fs,
          http,
        });
      } catch (error) {
        localEcho.println((error as Error).message);
      }
      break;
    }
    case "status": {
      const [url] = args;

      const dirName = url
        ?.split("/")
        .pop()
        ?.replace(/\.git$/, "");
      const dir = dirName ? join(cd, dirName) : cd;
      localEcho.println(`status started: ${dir}`);

      try {
        const result = await statusMatrix({ dir, fs });
        for (const entry of result) {
          // if (entry[1] === 1 && entry[2] === 1 && entry[3] === 1) {
          //   continue;
          // }

          if (entry[1] === 1 && entry[2] === 2 && entry[3] === 1) {
            localEcho.println(`        modified: ${entry[0]}`);
          }

          if (entry[1] === 1 && entry[2] === 2 && entry[3] === 2) {
            localEcho.println(`        staged: ${entry[0]}`);
          }
        }
      } catch (error) {
        localEcho.println((error as Error).message);
      }
      break;
    }
    case "add": {
      const [filePath] = args;
      localEcho.println(`add started: ${filePath}`);
      try {
        await add({
          dir: cd,
          filepath: filePath,
          fs,
        });
      } catch (error) {
        localEcho.println((error as Error).message);
      }
      break;
    }
    case "commit": {
      const [url] = args;
      const dirName = url
        ?.split("/")
        .pop()
        ?.replace(/\.git$/, "");
      const dir = dirName ? join(cd, dirName) : cd;

      localEcho.println(`commit started`);
      try {
        // If we want to use corsProxy then add it here: corsProxy
        const sha = await commit({
          ...options,
          author: {
            email: "foo@john.com",
            name: "Jhn",
          },
          dir,
          message: "This is a commit",
        });
        localEcho.println(`commited -> ${sha}`);
      } catch (error) {
        localEcho.println((error as Error).message);
      }
      break;
    }
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

        // If we want to use corsProxy then add it here: corsProxy
        await clone({ ...options, dir, http, onMessage, url });
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
    default:
      help(localEcho, commands);
  }

  updateFolder(cd);
};

export default processGit;
