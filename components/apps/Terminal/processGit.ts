import { join } from "path";
import { type FSModule } from "browserfs/dist/node/core/FS";
import {
  type AuthCallback,
  type GitAuth,
  type MessageCallback,
  type ProgressCallback,
  type default as index,
} from "isomorphic-git";
import { type ParsedArgs } from "minimist";
import { help } from "components/apps/Terminal/functions";

const corsProxy = "https://cors.isomorphic-git.org";

const UPDATE_FOLDER_COMMANDS = new Set([
  "checkout",
  "clone",
  "fetch",
  "init",
  "merge",
  "pull",
]);

export const commands: Record<string, string> = {
  add: "Add a file to the git index (aka staging area)",
  branch: "Create a branch",
  checkout: "Checkout a branch",
  clone: "Clone a repository",
  commit: "Create a new commit",
  fetch: "Fetch commits from a remote repository",
  init: "Initialize a new repository",
  log: "Get commit descriptions from the git history",
  merge: "Merge two branches",
  pull: "Fetch and merge commits from a remote repository",
  push: "Push a branch or tag",
  status: "Tell whether a file has been changed",
  tag: "Create a lightweight tag",
  version: "Return the version number of isomorphic-git",
};

type GitOptions = Record<string, unknown>;
type GitFunction = (options: GitOptions) => Promise<string | void>;

const processGit = async (
  [command, ...args]: string[],
  cd: string,
  printLn: (message: string) => void,
  fs: FSModule,
  updateFolder: (folder: string, newFile?: string, oldFile?: string) => void
): Promise<void> => {
  const git = await import("isomorphic-git");

  if (command in git) {
    const http = await import("isomorphic-git/http/web");
    const { default: minimist } = await import("minimist");
    const { username, password, ...cliArgs } = minimist(args) as GitAuth &
      ParsedArgs;
    const onAuth: AuthCallback = () => ({ password, username });
    const onMessage: MessageCallback = (message = "") =>
      printLn(`remote: ${message.trim()}`);
    const events: string[] = [];
    const onProgress: ProgressCallback = ({ phase }): void => {
      if (events[events.length - 1] !== phase) {
        printLn(phase);
        events.push(phase);
      }
    };
    const options: GitOptions = {
      ...cliArgs,
      corsProxy,
      dir: cd,
      fs,
      http,
      onAuth,
      onMessage,
      onProgress,
    };

    if (command === "clone") {
      if (
        !options.url &&
        cliArgs._ &&
        Array.isArray(cliArgs._) &&
        cliArgs._.length === 1
      ) {
        const [url] = cliArgs._;

        options.url = url;
      }

      const dirName =
        (options.url as string)
          ?.split("/")
          .pop()
          ?.replace(/\.git$/, "") || "";

      if (dirName) {
        printLn(`Cloning into '${dirName}'...`);

        options.dir = join(cd, dirName);
      }
    }

    try {
      const result = await (
        git[command as keyof typeof index] as GitFunction
      )?.(options);

      if (typeof result === "string") {
        printLn(result);
      }
    } catch (error) {
      printLn((error as Error).message);
    }

    if (UPDATE_FOLDER_COMMANDS.has(command)) {
      updateFolder(cd);
    }
  } else {
    help(printLn, commands);
  }
};

export default processGit;
