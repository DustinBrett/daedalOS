/* eslint-disable import/no-extraneous-dependencies */
import { memo, useRef, useState } from "react";
import { format } from "date-fns";
import { Flex } from "@chakra-ui/react";
import { Icon } from "@iconify/react";
import AppleMenu from "components/system/Taskbar/Topbar/menus/AppleMenu";

const Taskbar: FC = () => {
  interface TopBarState {
    date: Date;
    showAppleMenu: boolean;
    showControlCenter: boolean;
    showWifiMenu: boolean;
  }

  const [state, setState] = useState<TopBarState>({
    date: new Date(),
    showAppleMenu: true,
    showControlCenter: false,
    showWifiMenu: false,
  });

  const appleBtnRef = useRef<HTMLDivElement>(null);
  const toggleAppleMenu = (): void => {
    setState({
      ...state,
      showAppleMenu: !state.showAppleMenu,
    });
  };

  const logout = (): void => {
    controls.pause();
    props.setLogin(false);
  };

  const shut = (e: React.MouseEvent<HTMLLIElement>): void => {
    controls.pause();
    props.shutMac(e);
  };

  const restart = (e: React.MouseEvent<HTMLLIElement>): void => {
    controls.pause();
    props.restartMac(e);
  };

  const sleep = (e: React.MouseEvent<HTMLLIElement>): void => {
    controls.pause();
    props.sleepMac(e);
  };

  return (
    <div className="w-full h-8 px-2 fixed top-0 flex justify-between text-sm text-white bg-gray-700/10 backdrop-blur-2xl shadow transition p-1 px-2">
      <Flex className="gap-1">
        <div className="space-x-1 font-semibold h-6 px-2 cursor-default rounded inline-flex hover:bg-gray-100/30 hover:dark:bg-gray-400/40 ">
          <Icon className="w-5 h-5" icon="ic:outline-apple" />
        </div>
        <div className="space-x-1 font-semibold h-6 px-2 cursor-default rounded inline-flex hover:bg-gray-100/30 hover:dark:bg-gray-400/40 ">
          Finder
        </div>
        {state.showAppleMenu && (
          <AppleMenu
            btnRef={appleBtnRef}
            logout={logout}
            restart={restart}
            shut={shut}
            sleep={sleep}
            toggleAppleMenu={toggleAppleMenu}
          />
        )}
      </Flex>

      <div className="space-x-1 h-6 px-2 cursor-default rounded inline-flex hover:bg-gray-100/30 hover:dark:bg-gray-400/40 ">
        <span>{format(state.date, "eee MMM d")}</span>
        <span>{format(state.date, "h:mm aa")}</span>
      </div>
    </div>
  );
};

export default memo(Taskbar);
