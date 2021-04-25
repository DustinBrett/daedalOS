/* eslint-disable camelcase */
import type { config as v86Config } from 'components/apps/V86/config';
import type { V86ImageConfig } from 'components/apps/V86/image';

export type ModeCallback = (isGraphical: boolean) => void;
export type SizeCallback = (dimensions: number[]) => void;

type EventListener = (
  event: string,
  callback: SizeCallback | ModeCallback
) => void;

export type V86Starter = {
  add_listener: EventListener;
  destroy: () => void;
  lock_mouse: () => void;
  remove_listener: EventListener;
};

export type V86 = {
  emulator: V86Starter | null;
  lockMouse: () => void;
};

type V86Config = typeof v86Config &
  V86ImageConfig & {
    memory_size: number;
    vga_memory_size: number;
    boot_order: number;
    screen_container: HTMLDivElement | null;
  };

interface V86Constructor {
  new (config: V86Config): V86Starter;
}

declare global {
  interface Window {
    V86Starter: V86Constructor;
  }
  interface Navigator {
    deviceMemory: number;
  }
}
