import { memo, useEffect, useRef, useState } from "react";
import { getNetworkConfig } from "components/apps/IRC/config";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import StyledLoading from "components/system/Apps/StyledLoading";
import { useProcess, useProcessesActions } from "contexts/process";
import processDirectory from "contexts/process/directory";
import { IFRAME_CONFIG } from "utils/constants";

type KiwiIrcClient = {
  on: ((
    event: "irc.join" | "irc.part",
    callback: (
      channelData: {
        channel: string;
      },
      serverData: {
        name: string;
      }
    ) => void
  ) => void) &
    ((
      event: "active.component.toggle" | "server.tab.show",
      callback: () => void
    ) => void);
  state: {
    $emit: (event: string) => void;
    ui: { is_narrow: boolean };
  };
};

const IRC: FC<ComponentProcessProps> = ({ id }) => {
  const { linkElement, title } = useProcessesActions();
  const { libs: [ircSrc = ""] = [] } = useProcess(id);
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

      // Kiwi only closes its narrow drawer on buffer clicks, leaving server
      // tabs (channel list) and app settings opened underneath it
      const hideNarrowStateBrowser = (): void => {
        if (kiwiWindow.kiwi.state.ui.is_narrow) {
          kiwiWindow.kiwi.state.$emit("statebrowser.hide");
        }
      };

      kiwiWindow?.kiwi.on("server.tab.show", hideNarrowStateBrowser);
      kiwiWindow?.kiwi.on("active.component.toggle", hideNarrowStateBrowser);

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
        // Busy on the content only, never on an ancestor of the
        // role="status" loader or its announcement may be withheld
        aria-busy={!loaded || undefined}
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
