import type { Message } from "components/apps/IRC/functions";
import {
  connect,
  DEFAULT_NAME,
  DEFAULT_PORT,
  DEFAULT_SERVER,
} from "components/apps/IRC/functions";
import StyledIRC from "components/apps/IRC/StyledIRC";
import { useEffect, useRef, useState } from "react";

const IRC = (): JSX.Element => {
  const [log, setLog] = useState<string[]>([]);
  const [socket, setSocket] = useState<WebSocket>();

  const addressRef = useRef<HTMLInputElement | null>(null);
  const portRef = useRef<HTMLInputElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const commandRef = useRef<HTMLInputElement | null>(null);
  const outputRef = useRef<HTMLTextAreaElement | null>(null);

  const newLine = ({ parameters }: Message): void => {
    if (parameters) {
      setLog((currentLog) => [...currentLog, parameters]);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      const command = e.currentTarget.value;

      e.currentTarget.value = "";

      if (command) {
        socket?.send(command);
        newLine({
          parameters: command,
          type: "command",
        });
      }
    }
  };

  useEffect(() => {
    if (outputRef.current instanceof HTMLTextAreaElement) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <StyledIRC>
      <nav>
        <input ref={addressRef} defaultValue={DEFAULT_SERVER} id="address" />
        <input ref={portRef} defaultValue={DEFAULT_PORT} id="port" />
        <input ref={nameRef} defaultValue={DEFAULT_NAME} id="name" />
        <button
          onClick={() =>
            setSocket(
              connect(
                addressRef.current?.value ?? "",
                portRef.current?.value ?? "",
                nameRef.current?.value ?? "",
                newLine
              )
            )
          }
          type="button"
        >
          Connect
        </button>
      </nav>
      <textarea ref={outputRef} value={log.join("\n")} readOnly />
      <input ref={commandRef} onKeyDown={onKeyDown} />
    </StyledIRC>
  );
};

export default IRC;
