import {
  HIGH_PRIORITY_REQUEST,
  MILLISECONDS_IN_SECOND,
  ONE_TIME_PASSIVE_EVENT,
} from "utils/constants";

let IPFS_GATEWAY_URL = "";

export const IPFS_GATEWAY_URLS = [
  "https://<CID>.ipfs.dweb.link/",
  "https://gateway.ipfs.io/ipfs/<CID>/",
];

const isIpfsGatewayAvailable = (gatewayUrl: string): Promise<boolean> =>
  new Promise((resolve) => {
    const timeoutId = window.setTimeout(
      () => resolve(false),
      MILLISECONDS_IN_SECOND
    );
    const img = new Image();

    img.addEventListener(
      "load",
      () => {
        window.clearTimeout(timeoutId);
        resolve(true);
      },
      ONE_TIME_PASSIVE_EVENT
    );
    img.addEventListener(
      "error",
      () => {
        window.clearTimeout(timeoutId);
        resolve(false);
      },
      ONE_TIME_PASSIVE_EVENT
    );

    img.src = `${gatewayUrl.replace(
      "<CID>",
      // https://github.com/ipfs/public-gateway-checker/blob/master/src/constants.ts (IMG_HASH)
      "bafybeibwzifw52ttrkqlikfzext5akxu7lz4xiwjgwzmqcpdzmp3n5vnbe"
    )}?now=${Date.now()}&filename=1x1.png#x-ipfs-companion-no-redirect`;
  });

export const getIpfsGatewayUrl = async (
  ipfsUrl: string,
  notCurrent?: boolean
): Promise<string> => {
  if (!IPFS_GATEWAY_URL || notCurrent) {
    const urlList = notCurrent
      ? IPFS_GATEWAY_URLS.filter((url) => url !== IPFS_GATEWAY_URL)
      : IPFS_GATEWAY_URLS;

    for (const url of urlList) {
      // eslint-disable-next-line no-await-in-loop
      if (await isIpfsGatewayAvailable(url)) {
        IPFS_GATEWAY_URL = url;
        break;
      }
    }

    if (!IPFS_GATEWAY_URL) return "";
  }

  const { hostname, pathname, protocol, search } = new URL(ipfsUrl);

  if (protocol !== "ipfs:") return "";

  const fullPath = `${hostname}${pathname}`;
  const [cid = "", ...path] = fullPath.split("/").filter(Boolean);
  const { CID } = await import("multiformats");

  return `${IPFS_GATEWAY_URL.replace(
    "<CID>",
    CID.parse(cid).toV1().toString()
  )}${path.join("/")}${search}`;
};

export const getIpfsFileName = async (
  ipfsUrl: string,
  ipfsData: Buffer
): Promise<string> => {
  const { hostname, pathname, searchParams } = new URL(ipfsUrl);
  const fileName = searchParams.get("filename");

  if (fileName) return fileName;

  const { fileTypeFromBuffer } = await import("file-type");
  const { ext = "" } = (await fileTypeFromBuffer(ipfsData)) || {};
  const fullPath = `${hostname}${pathname}`;

  return `${fullPath.split("/").filter(Boolean).join("_")}${ext ? `.${ext}` : ""}`;
};

export const getIpfsResource = async (ipfsUrl: string): Promise<Buffer> => {
  let response: Response | undefined;
  const requestOptions = {
    ...HIGH_PRIORITY_REQUEST,
    cache: "no-cache",
    credentials: "omit",
    keepalive: false,
    mode: "cors",
    referrerPolicy: "no-referrer",
    // eslint-disable-next-line unicorn/no-null
    window: null,
  } as RequestInit;

  try {
    response = await fetch(await getIpfsGatewayUrl(ipfsUrl), requestOptions);
  } catch (error) {
    if ((error as Error).message === "Failed to fetch") {
      response = await fetch(
        await getIpfsGatewayUrl(ipfsUrl, true),
        requestOptions
      );
    }
  }

  return response instanceof Response
    ? Buffer.from(await response.arrayBuffer())
    : Buffer.from("");
};
