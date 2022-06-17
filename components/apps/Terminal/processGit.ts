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
  const {
    add,
    checkout,
    clone,
    commit,
    currentBranch,
    log,
    push,
    statusMatrix,
    version,
  } = await import("isomorphic-git");
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

      try {
        await push({
          dir,
          fs,
          http,
        });
        localEcho.println("done");
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

      const branch =
        (await currentBranch({
          dir,
          fs,
          fullname: false,
        })) || "<invalid>";

      localEcho.println(`On branch ${branch}`);

      try {
        const statusOfFiles = await statusMatrix({ dir, fs });

        // Find all changes not staged for commit:
        const notStaged = statusOfFiles.filter(
          (flags) => flags[1] === 1 && flags[2] === 2 && flags[3] === 1
        );
        if (notStaged.length > 0) {
          localEcho.println(``);
          localEcho.println(`Changes not staged for commit:`);
        }
        notStaged.forEach((file) => {
          localEcho.println(`        modified: ${file[0]}`);
        });

        // Changes to be committed:
        const staged = statusOfFiles.filter(
          (flags) => flags[1] === 1 && flags[2] === 2 && flags[3] === 2
        );
        const stagedAdded = statusOfFiles.filter(
          (flags) => flags[1] === 0 && flags[2] === 2 && flags[3] === 2
        );
        if (stagedAdded.length > 0 || staged.length > 0) {
          localEcho.println(``);
          localEcho.println(`Changes to be committed:`);
        }
        staged.forEach((file) => {
          localEcho.println(`        modified: ${file[0]}`);
        });
        stagedAdded.forEach((file) => {
          localEcho.println(`        new file: ${file[0]}`);
        });

        // Untracked files:
        const untracked = statusOfFiles.filter(
          (flags) => flags[1] === 0 && flags[2] === 2 && flags[3] === 0
        );
        if (untracked.length > 0) {
          localEcho.println(``);
          localEcho.println(`Untracked files:`);
        }
        untracked.forEach((file) => {
          localEcho.println(`        ${file[0]}`);
        });

        if (notStaged.length + staged.length + stagedAdded.length === 0) {
          localEcho.println(``);
          localEcho.println(`nothing to commit, working tree clean`);
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
    case "log": {
      const [url] = args;
      const dirName = url
        ?.split("/")
        .pop()
        ?.replace(/\.git$/, "");
      const dir = dirName ? join(cd, dirName) : cd;
      try {
        // If we want to use corsProxy then add it here: corsProxy
        const commitResults = await log({
          depth: 5,
          dir,
          fs,
        });
        commitResults.forEach((commitResult) => {
          localEcho.println(`commit ${commitResult.oid}`);
          localEcho.println(
            `Author: ${commitResult.commit.author.name} <${commitResult.commit.author.email}>`
          );
          localEcho.println(`Date: ${commitResult.commit.author.timestamp}`);
          localEcho.println(``);
          localEcho.println(`    ${commitResult.commit.message}`);
          localEcho.println(``);
        });
      } catch (error) {
        localEcho.println((error as Error).message);
      }
      break;
    }
    case "commit": {
      const messageArgumentStart = args.indexOf("-m");
      const commitMessage = args[messageArgumentStart + 1];

      try {
        const commitSha = await commit({
          ...options,
          author: {
            email: "johndoe@devmatch.xyz",
            name: "John Doe",
          },
          dir: cd,
          message: commitMessage,
        });

        const branchName =
          (await currentBranch({
            dir: cd,
            fs,
            fullname: false,
          })) || "";

        localEcho.println(
          `[${branchName} ${commitSha.slice(0, 7)}] ${commitMessage}`
        );
      } catch (error) {
        console.error(error);
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
