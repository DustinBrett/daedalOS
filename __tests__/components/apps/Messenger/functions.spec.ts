/**
 * @jest-environment node
 */
import { GiftWrap, PrivateDirectMessage, Seal } from "nostr-tools/kinds";
import { nprofileEncode, npubEncode } from "nostr-tools/nip19";
import { createWrap } from "nostr-tools/nip59";
import { type Event, generateSecretKey, getEventHash } from "nostr-tools/pure";
import { bytesToHex } from "nostr-tools/utils";
import { MAX_GIFT_WRAP_AGE_IN_SECONDS } from "components/apps/Messenger/constants";
import {
  createMessage,
  findSpamKeys,
  getUnixTime,
  importSecretKey,
  resolveAddress,
  shortNpub,
  unwrapMessage,
} from "components/apps/Messenger/functions";
import {
  type DirectMessage,
  type Signer,
} from "components/apps/Messenger/types";

globalThis.localStorage = { setItem: jest.fn() } as unknown as Storage;

const newSigner = (): Signer =>
  importSecretKey(bytesToHex(generateSecretKey())) as Signer;

const alice = newSigner();
const bob = newSigner();
const eve = newSigner();

const sealRumor = async (
  sealer: Signer,
  rumor: { content: string; pubkey: string; tags: string[][] },
  recipient: string
): Promise<Event> => {
  const fullRumor = {
    ...rumor,
    created_at: getUnixTime(),
    kind: PrivateDirectMessage,
  };

  return createWrap(
    await sealer.signEvent({
      content: await sealer.encrypt(
        recipient,
        JSON.stringify({ ...fullRumor, id: getEventHash(fullRumor) })
      ),
      created_at: getUnixTime(),
      kind: Seal,
      tags: [],
    }),
    recipient
  );
};

describe("gift wrapped messages", () => {
  it("hide the sender and time", async () => {
    const { recipientEvent } = await createMessage(alice, bob.publicKey, "hi");

    expect(recipientEvent.kind).toBe(GiftWrap);
    expect(recipientEvent.pubkey).not.toBe(alice.publicKey);
    expect(recipientEvent.tags).toStrictEqual([["p", bob.publicKey]]);
    expect(recipientEvent.created_at).toBeGreaterThan(
      getUnixTime() - MAX_GIFT_WRAP_AGE_IN_SECONDS - 1
    );
  });

  it("can only be read by the recipient and the sender's copy", async () => {
    const { message, recipientEvent, selfEvent } = await createMessage(
      alice,
      bob.publicKey,
      "hi"
    );

    await expect(unwrapMessage(bob, recipientEvent)).resolves.toStrictEqual({
      content: "hi",
      created_at: message.created_at,
      id: message.id,
      pubkey: alice.publicKey,
      recipient: bob.publicKey,
    });
    await expect(
      unwrapMessage(alice, selfEvent as Event)
    ).resolves.toStrictEqual(message);
    await expect(unwrapMessage(eve, recipientEvent)).resolves.toBeUndefined();
  });

  it("rejects a rumor claiming another sender", async () => {
    const wrap = await sealRumor(
      eve,
      {
        content: "I am alice",
        pubkey: alice.publicKey,
        tags: [["p", bob.publicKey]],
      },
      bob.publicKey
    );

    await expect(unwrapMessage(bob, wrap)).resolves.toBeUndefined();
  });

  it("rejects a conversation the recipient isn't part of", async () => {
    const wrap = await sealRumor(
      alice,
      {
        content: "for eve",
        pubkey: alice.publicKey,
        tags: [["p", eve.publicKey]],
      },
      bob.publicKey
    );

    await expect(unwrapMessage(bob, wrap)).resolves.toBeUndefined();
  });
});

describe("legacy messages", () => {
  it("can be read by both participants", async () => {
    const { message, recipientEvent, selfEvent } = await createMessage(
      alice,
      bob.publicKey,
      "legacy",
      true
    );

    expect(selfEvent).toBeUndefined();
    await expect(unwrapMessage(bob, recipientEvent)).resolves.toStrictEqual(
      message
    );
    await expect(unwrapMessage(alice, recipientEvent)).resolves.toStrictEqual(
      message
    );
  });
});

describe("resolves addresses", () => {
  const { publicKey } = bob;
  const npub = npubEncode(publicKey);

  it.each([
    npub,
    `nostr:${npub}`,
    nprofileEncode({ pubkey: publicKey, relays: ["wss://nos.lol"] }),
    publicKey.toUpperCase(),
    shortNpub(publicKey),
    npub.slice(0, 12),
    npub.slice(0, -1),
  ])("%p", async (address) => {
    await expect(
      resolveAddress(address, [alice.publicKey, publicKey])
    ).resolves.toBe(publicKey);
  });

  it("rejects shortened addresses that aren't contacts", async () => {
    await expect(resolveAddress(shortNpub(publicKey), [])).resolves.toBe("");
    await expect(resolveAddress("npub1", [publicKey])).resolves.toBe("");
  });

  it("looks up NIP-05 names", async () => {
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ names: { DustinBrett: publicKey } }),
        ok: true,
      })
    ) as unknown as typeof fetch;

    await expect(resolveAddress("dustinbrett@example.com", [])).resolves.toBe(
      publicKey
    );
    await expect(resolveAddress("nobody@example.com", [])).resolves.toBe("");
  });
});

const strangerMessage = (pubkey: string, content: string): DirectMessage => ({
  content,
  created_at: 0,
  id: `${pubkey}${content}`,
  pubkey,
  recipient: alice.publicKey,
});

describe("finds likely spam", () => {
  it("flags blasts and links but not repeated greetings", () => {
    const blast = "Claim your free sats today before they run out";

    expect([
      ...findSpamKeys([
        strangerMessage("a", blast),
        strangerMessage("b", ` ${blast.toUpperCase()}`),
        strangerMessage("c", "hi"),
        strangerMessage("d", "hi"),
        strangerMessage("e", "see https://example.com"),
        strangerMessage("f", "Long but original message from a visitor"),
      ]),
    ]).toStrictEqual(["a", "b", "e"]);
  });
});
