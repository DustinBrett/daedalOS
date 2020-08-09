import type { DosFactory } from 'js-dos';

export type WindowWithDosModule = Window &
  typeof globalThis & { Dos: DosFactory };
