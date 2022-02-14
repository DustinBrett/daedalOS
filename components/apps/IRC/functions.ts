export const DEFAULT_SERVER = "irc.unrealircd.org";
export const DEFAULT_PORT = "443";
export const DEFAULT_NAME = "daedalOS";

export type Message = {
  command?: string;
  error?: string;
  parameters?: string;
  prefix?: string;
  type?: string;
};

type IrcOutput = (output: Message) => void;

const parseMessage = (message: string, name: string): Message => {
  let prefix = "";
  let command = message;
  let parameters: string[] = [];
  let type = "message";

  if (message.startsWith(":")) {
    const prefixEnd = message.indexOf(" ");

    if (prefixEnd === -1) {
      return { error: "No prefix" };
    }

    [prefix, command, ...parameters] = message.slice(1).split(" ");

    if (parameters[0] === name) {
      parameters = parameters.slice(1);
    }
  }

  if (!prefix || prefix === name) {
    type = "notice";
  }

  return {
    command,
    parameters: parameters
      .map((parameter) =>
        parameter.startsWith(":") ? parameter.slice(1) : parameter
      )
      .join(" "),
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
    cb?.(parseMessage(line, name));
  }
};

export const connect = (
  address: string,
  port: string,
  nickName: string,
  cb?: IrcOutput
): WebSocket => {
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
