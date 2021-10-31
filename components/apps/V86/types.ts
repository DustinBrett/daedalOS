import type { config } from "components/apps/V86/config";
import type { V86ImageConfig } from "components/apps/V86/image";

export type SizeCallback = (dimensions: number[]) => void;

type EventListener = (event: string, callback: SizeCallback) => void;

export type V86Starter = {
  add_listener: EventListener;
  destroy: () => void;
  lock_mouse: () => void;
  remove_listener: EventListener;
  save_state: (callback: (error: Error, newState: ArrayBuffer) => void) => void;
};

export type V86Config = V86ImageConfig &
  typeof config & {
    boot_order: number;
    initial_state?: { url: string };
    screen_container: HTMLDivElement | null;
  };

type V86Constructor = new (v86Config: V86Config) => V86Starter;

declare global {
  interface Window {
    V86Starter: V86Constructor;
  }
}
