const IRC_SERVERS = [
  ["Libera.Chat", "web.libera.chat/webirc/websocket/"],
  ["ErgoTestnet", "testnet.ergo.chat/webirc"],
  ["InspIRCd Testnet", "testnet.inspircd.org", 8097],
];

export const getNetworkConfig = (nickName: string): Record<string, unknown> => {
  const nick = `${nickName}${[9, 9, 9, 9]
    .map((x) => Math.floor(Math.random() * x))
    .join("")}`;

  return {
    networks: IRC_SERVERS.map(([name, server, port = 443], id) => ({
      buffers: [
        {
          enabled: true,
          name: "*",
          settings: {},
        },
      ],
      connection: {
        direct: true,
        encoding: "utf8",
        nick,
        port,
        server,
        tls: true,
      },
      id: id + 1,
      name,
      settings: {
        show_raw_caps: false,
      },
    })),
  };
};
