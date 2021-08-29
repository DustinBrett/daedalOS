import AppsLoader from "components/system/Apps/AppsLoader";
import Desktop from "components/system/Desktop";
import FileManager from "components/system/Files/FileManager";
import Taskbar from "components/system/Taskbar";
import useUrlLoader from "utils/useUrlLoader";

const Home = (): React.ReactElement => {
  useUrlLoader();

  return (
    <Desktop>
      <FileManager url="/desktop" view="icon" />
      <Taskbar />
      <AppsLoader />
    </Desktop>
  );
};

export default Home;
