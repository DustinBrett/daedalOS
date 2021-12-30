import AppsLoader from "components/system/Apps/AppsLoader";
import Desktop from "components/system/Desktop";
import Taskbar from "components/system/Taskbar";
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

  useEffect(() => {
    lockTitle();
    window.commit = commit;
  }, [commit]);

  return (
    <Desktop>
      <Taskbar />
      <AppsLoader />
    </Desktop>
  );
};

export const getStaticProps = async (): Promise<{ props: IndexProps }> => {
  const { execSync } = await import("child_process");
  const HEAD = await execSync("git rev-parse --short HEAD", { cwd: __dirname });

  return {
    props: {
      commit: HEAD.toString().trim(),
    },
  };
};

export default Index;
