/* eslint-disable camelcase */
import type { config } from "components/apps/V86/config";
import type { V86ImageConfig } from "components/apps/V86/image";

export type SizeCallback = (dimensions: number[]) => void;

type EventListener = (event: string, callback: SizeCallback) => void;

export type V86Starter = {
  add_listener: EventListener;
  destroy: () => void;
  lock_mouse: () => void;
  remove_listener: EventListener;
};

export type V86 = {
  emulator?: V86Starter;
  lockMouse?: () => void;
};

type V86Config = typeof config &
  V86ImageConfig & {
    boot_order: number;
    screen_container: HTMLDivElement | null;
  };

interface V86Constructor {
  new (v86Config: V86Config): V86Starter;
}

declare global {
  interface Window {
    V86Starter: V86Constructor;
  }
  interface Navigator {
    deviceMemory: number;
  }
}
