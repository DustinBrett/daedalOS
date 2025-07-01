import { memo, useEffect, useRef, useState } from "react";
import { getNetworkConfig } from "components/apps/IRC/config";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledLoading from "components/system/Apps/StyledLoading";
import { useProcesses } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { IFRAME_CONFIG } from "utils/constants";

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
  const {
    linkElement,
    processes: { [id]: { libs: [ircSrc = ""] = [] } = {} } = {},
    title,
  } = useProcesses();
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
      const kiwiWindow = iframeRef.current.contentWindow as Window & {
        kiwi: KiwiIrcClient;
      };

      kiwiWindow?.kiwi.on("irc.join", ({ channel }, { name }) =>
        setChannels((currentChannels) => [
          ...new Set([...currentChannels, `${channel}/${name}`]),
        ])
      );
      kiwiWindow?.kiwi.on("irc.part", ({ channel }, { name }) =>
        setChannels((currentChannels) =>
          currentChannels.filter(
            (currentChannel) => currentChannel !== `${channel}/${name}`
          )
        )
      );

      linkElement(id, "peekElement", iframeRef.current);
    }
  }, [id, linkElement, loaded]);

  useEffect(() => {
    title(
      id,
      `${processDirectory.IRC.title}${
        channels.length === 0 ? "" : ` - ${channels.join(", ")}`
      }`
    );
  }, [channels, id, title]);

  return (
    <div>
      {!loaded && <StyledLoading />}
      <iframe
        ref={iframeRef}
        height="100%"
        onLoad={() => setLoaded(true)}
        src={ircSrc}
        title={id}
        width="100%"
        {...IFRAME_CONFIG}
      />
    </div>
  );
};

export default memo(IRC);
