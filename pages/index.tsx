import AppsLoader from "components/system/Apps/AppsLoader";
import Desktop from "components/system/Desktop";
import Taskbar from "components/system/Taskbar";
import useIFrameFocuser from "utils/useIFrameFocuser";
import useUrlLoader from "utils/useUrlLoader";

const Index = (): React.ReactElement => {
  useIFrameFocuser();
  useUrlLoader();

  return (
    <Desktop>
      <Taskbar />
      <AppsLoader />
    </Desktop>
  );
};

export default Index;
