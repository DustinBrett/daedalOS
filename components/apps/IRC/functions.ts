import {
  DATA_RPL,
  RPL_MYINFO,
  SYSTEM_RPL,
} from "components/apps/IRC/constants";
import type {
  IrcOutput,
  Message,
  MessageTypes,
} from "components/apps/IRC/types";

let seenCommands: string[] = [];
let connectedServer: string = "";

const trimColon = (string: string): string => string.replace(/^:/, "");

const parseMessage = (message: string, name: string): Message => {
  let prefix = "";
  let command = message;
  let parameters: string[] = [];
  let type: MessageTypes = "message";

  console.info({ message, name });

  if (message.startsWith(":")) {
    const prefixEnd = message.indexOf(" ");

    if (prefixEnd === -1) {
      // TODO: Handle @tags
      return { error: "No prefix" };
    }

    [prefix, command, ...parameters] = message.slice(1).split(" ");

    if (!prefix || prefix === name || prefix.startsWith(`${name}!~${name}@`)) {
      type = "notice";
    }

    if (parameters[0] === name) {
      parameters = parameters.slice(1);
    }

    if (DATA_RPL.has(command)) {
      while (parameters[0] && !Number.isNaN(Number(parameters[0]))) {
        parameters = parameters.slice(1);
      }
    } else if (command === RPL_MYINFO) {
      // eslint-disable-next-line prefer-destructuring
      connectedServer = parameters[0];
    }
  }

  console.info({ command, parameters, prefix, type });

  return {
    command,
    parameters: parameters.map((parameter) => trimColon(parameter)).join(" "),
    prefix,
    type,
  };
};

const processLine = (
  line: string,
  socket: WebSocket,
  name: string,
  cb?: IrcOutput
): void => {
  if (line.startsWith("PING")) {
    const [, id] = line.split(" ");
    const response = `PONG ${id}`;

    socket.send(response);
  } else {
    const message = parseMessage(line, name);

    if (message.command) {
      cb?.(message, name, connectedServer, seenCommands);

      if (
        !SYSTEM_RPL.has(message.command) &&
        !seenCommands.includes(message.command)
      ) {
        seenCommands.push(message.command);
      }
    }
  }
};

export const connect = (
  address: string,
  port: number | string,
  nickName: string,
  cb?: IrcOutput
): WebSocket => {
  seenCommands = [];

  cb?.({
    parameters: `* Connecting to ${address} (${port})`,
    type: "system",
  });

  const socket = new WebSocket(`wss://${address}:${port}`);
  const onOpen = (): void => {
    socket.send(`NICK ${nickName}`);
    socket.send(`USER ${nickName} 0 0 0`);
  };
  const onMessage = async ({ data }: { data: Blob | string }): Promise<void> =>
    processLine(
      data instanceof Blob ? await data.text() : data,
      socket,
      nickName,
      cb
    );

  socket.addEventListener("open", onOpen);
  socket.addEventListener("message", onMessage);

  return socket;
};
