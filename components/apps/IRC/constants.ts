export const RPL_WELCOME = "001";
export const RPL_MYINFO = "004";
export const RPL_ISUPPORT = "005";
export const RPL_UMODEIS = "221";
export const RPL_LUSERCLIENT = "251";
export const RPL_LOCALUSERS = "265";
export const RPL_GLOBALUSERS = "266";
export const RPL_MOTD = "372";
export const RPL_MOTDSTART = "375";
export const RPL_ENDOFMOTD = "376";
export const RPL_HOSTHIDDEN = "396";
export const ERR_NOMOTD = "422";

export const NOTICE_RPL = new Set([
  RPL_WELCOME,
  RPL_MYINFO,
  RPL_ISUPPORT,
  RPL_UMODEIS,
  RPL_LUSERCLIENT,
  RPL_LOCALUSERS,
  RPL_MOTD,
  RPL_MOTDSTART,
  RPL_ENDOFMOTD,
  RPL_HOSTHIDDEN,
  ERR_NOMOTD,
]);

export const DATA_RPL = new Set([RPL_LOCALUSERS, RPL_GLOBALUSERS]);

export const SYSTEM_RPL = new Set(["MODE", "NOTICE"]);

export const servers = [
  {
    name: "UnrealIRCd",
    server: "irc.unrealircd.org",
  },
  {
    name: "Ergo",
    server: "testnet.ergo.chat/webirc",
  },
  {
    name: "InspIRCd",
    port: 8097,
    server: "testnet.inspircd.org",
  },
];
