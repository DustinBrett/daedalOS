import { ErrorBoundary } from "components/pages/ErrorBoundary";
import AppsLoader from "components/system/Apps/AppsLoader";
import Desktop from "components/system/Desktop";
import Taskbar from "components/system/Taskbar";
import useGlobalKeyboardShortcuts from "hooks/useGlobalKeyboardShortcuts";
import useIFrameFocuser from "hooks/useIFrameFocuser";
import useUrlLoader from "hooks/useUrlLoader";
import { useEffect } from "react";
import { lockTitle } from "utils/functions";

declare global {
  interface Window {
    commit?: string;
  }
}

type IndexProps = { commit?: string };

const Index = ({ commit }: IndexProps): React.ReactElement => {
  useIFrameFocuser();
  useUrlLoader();
  useGlobalKeyboardShortcuts();

  useEffect(() => {
    lockTitle();
    window.commit = commit;
  }, [commit]);

  return (
    <ErrorBoundary>
      <Desktop>
        <Taskbar />
        <AppsLoader />
      </Desktop>
    </ErrorBoundary>
  );
};

export const getStaticProps = async (): Promise<{ props: IndexProps }> => {
  const { execSync } = await import("child_process");
  let HEAD: Buffer | string = "";

  try {
    HEAD = execSync("git rev-parse --short HEAD", { cwd: __dirname });
    // eslint-disable-next-line no-empty
  } catch {}

  return {
    props: {
      commit: HEAD.toString().trim(),
    },
  };
};

export default Index;
