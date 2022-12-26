import { getNetworkConfig } from "components/apps/IRC/config";
import StyledIRC from "components/apps/IRC/StyledIRC";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledLoading from "components/system/Files/FileManager/StyledLoading";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { useEffect, useRef, useState } from "react";

type KiwiIrcClient = {
  on: (
    event: "irc.join" | "irc.part",
    callback: (
      channelData: {
        channel: string;
      },
      serverData: {
        name: string;
      }
    ) => void
  ) => void;
};

const IRC: FC<ComponentProcessProps> = ({ id }) => {
  const { processes: { [id]: { libs: [ircSrc = ""] = [] } = {} } = {}, title } =
    useProcesses();
  const [loaded, setLoaded] = useState(false);
  const [channels, setChannels] = useState<string[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!window.localStorage.getItem("kiwiirc")) {
      window.localStorage.setItem(
        "kiwiirc",
        JSON.stringify(getNetworkConfig("Guest"))
      );
    }
  }, []);

  useEffect(() => {
    if (loaded && iframeRef.current?.contentWindow) {
      (
        [
          ...iframeRef.current.contentWindow.document.querySelectorAll(
            ".kiwi-network-name-option-collapse"
          ),
        ] as HTMLDivElement[]
      ).forEach(
        (networkEntryCollapse, index) =>
          index !== 0 && networkEntryCollapse?.click()
      );

      (
        iframeRef.current.contentWindow as Window & {
          kiwi: KiwiIrcClient;
        }
      )?.kiwi.on("irc.join", ({ channel }, { name }) =>
        setChannels((currentChannels) => [
          ...new Set([...currentChannels, `${channel}/${name}`]),
        ])
      );
      (
        iframeRef.current.contentWindow as Window & {
          kiwi: KiwiIrcClient;
        }
      )?.kiwi.on("irc.part", ({ channel }, { name }) =>
        setChannels((currentChannels) =>
          currentChannels.filter(
            (currentChannel) => currentChannel !== `${channel}/${name}`
          )
        )
      );
    }
  }, [loaded]);

  useEffect(() => {
    title(
      id,
      `${processDirectory.IRC.title}${
        channels.length === 0 ? "" : ` - ${channels.join(", ")}`
      }`
    );
  }, [channels, id, title]);

  return (
    <StyledIRC>
      {!loaded && <StyledLoading />}
      <iframe
        ref={iframeRef}
        height="100%"
        onLoad={() => setLoaded(true)}
        src={ircSrc}
        title={id}
        width="100%"
      />
    </StyledIRC>
  );
};

export default IRC;
