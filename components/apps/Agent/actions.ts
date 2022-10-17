/* eslint-disable unicorn/no-array-callback-reference */
import type { AgentAction } from "components/apps/Agent/types";
import type { Processes } from "contexts/process/types";
import { basename, extname } from "path";
import { MILLISECONDS_IN_MINUTE, PROCESS_DELIMITER } from "utils/constants";

let actOnBlogPostView = true;

const isTinyMCE = (key: string): boolean =>
  key.startsWith(`TinyMCE${PROCESS_DELIMITER}`);

export const checkIfBlogPostHasBeenViewed = (
  previousProcesses: Processes,
  currentProcesses: Processes,
  act: AgentAction
): void => {
  if (
    actOnBlogPostView &&
    !Object.keys(previousProcesses).some(isTinyMCE) &&
    Object.keys(currentProcesses).some(isTinyMCE)
  ) {
    act((agent) => {
      const pid = Object.keys(currentProcesses).find(isTinyMCE);

      if (pid) {
        const { url } = currentProcesses[pid];

        if (url?.endsWith(".whtml")) {
          actOnBlogPostView = false;
          agent?.play("Reading", undefined, () =>
            agent?.speak(
              `I hope you enjoy reading ${basename(url, extname(url))}!`
            )
          );
          window.setTimeout(() => {
            actOnBlogPostView = true;
          }, MILLISECONDS_IN_MINUTE * 15);
        }
      }
    });
  }
};
