import {
  NOTICE_RPL,
  RPL_UMODEIS,
  servers,
  SYSTEM_RPL,
} from "components/apps/IRC/constants";
import { connect } from "components/apps/IRC/functions";
import StyledIRC from "components/apps/IRC/StyledIRC";
import type { Message } from "components/apps/IRC/types";
import type { ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useEffect, useRef, useState } from "react";
import { PACKAGE_DATA } from "utils/constants";

const [{ port = 443, server }] = servers;
const { alias } = PACKAGE_DATA;

const IRC: FC<ComponentProcessProps> = () => {
  const [log, setLog] = useState<string[]>([]);
  const [socket, setSocket] = useState<WebSocket>();

  const addressRef = useRef<HTMLInputElement | null>(null);
  const portRef = useRef<HTMLInputElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const commandRef = useRef<HTMLInputElement | null>(null);
  const outputRef = useRef<HTMLTextAreaElement | null>(null);

  // TODO: Handle bold/color lines
  const newLine = (
    { command, parameters, type }: Message,
    name = "",
    connectedServer = "",
    seenCommands: string[] = []
  ): void => {
    if (parameters) {
      let output = [parameters];

      if (command === RPL_UMODEIS) {
        output = [`${name} ${parameters}`];
      } else if (command === "MODE") {
        output = [`* ${name} sets mode: ${parameters}`];
      } else if (command === "NOTICE") {
        output = [`-${connectedServer}- ${parameters}`];
      } else if (command === "JOIN" && type === "notice") {
        // TODO: Open a new tab for the channel
        console.info(`Joined ${parameters}`);
      }

      if (
        command &&
        (SYSTEM_RPL.has(command) ||
          (NOTICE_RPL.has(command) && !seenCommands.includes(command)))
      ) {
        output.unshift("-");
      }

      setLog((currentLog) => [...currentLog, ...output]);
    }
  };

  const sendCommand = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      const command = e.currentTarget.value;

      e.currentTarget.value = "";

      if (command) {
        socket?.send(command);
      }
    }
  };

  useEffect(() => {
    if (outputRef.current instanceof HTMLTextAreaElement) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [log]);

  const connectToIrc = (): void =>
    setSocket(
      connect(
        addressRef.current?.value ?? server,
        portRef.current?.value ?? port,
        nameRef.current?.value ?? alias,
        newLine
      )
    );

  return (
    <StyledIRC>
      <nav>
        <input
          ref={addressRef}
          defaultValue={server}
          enterKeyHint="next"
          id="address"
        />
        <input
          ref={portRef}
          defaultValue={port}
          enterKeyHint="next"
          id="port"
        />
        <input
          ref={nameRef}
          defaultValue={alias}
          enterKeyHint="go"
          id="name"
          onKeyDown={({ key }) => {
            if (key === "Enter") connectToIrc();
          }}
        />
        <button onClick={connectToIrc} type="button">
          Connect
        </button>
      </nav>
      <textarea ref={outputRef} value={log.join("\n")} readOnly />
      <input ref={commandRef} enterKeyHint="send" onKeyDown={sendCommand} />
    </StyledIRC>
  );
};

export default IRC;
