import AppsLoader from 'components/system/Apps/AppsLoader';
import Desktop from 'components/system/Desktop';
import FileManager from 'components/system/Files/FileManager';
import Taskbar from 'components/system/Taskbar';

const Home = (): React.ReactElement => (
  <Desktop>
    <FileManager url="/desktop" />
    <Taskbar />
    <AppsLoader />
  </Desktop>
);

export default Home;
