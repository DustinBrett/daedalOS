import AppsLoader from "components/system/Apps/AppsLoader";
import Desktop from "components/system/Desktop";
import FileManager from "components/system/Files/FileManager";
import Taskbar from "components/system/Taskbar";
import useIFrameFocuser from "utils/useIFrameFocuser";
import useUrlLoader from "utils/useUrlLoader";

const Home = (): React.ReactElement => {
  useIFrameFocuser();
  useUrlLoader();

  return (
    <Desktop>
      <FileManager
        url="/Users/Public/Desktop"
        view="icon"
        hideLoading
        hideScrolling
      />
      <Taskbar />
      <AppsLoader />
    </Desktop>
  );
};

export default Home;
