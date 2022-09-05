export const BOOT_CD_FD_HD = 0x213;
export const BOOT_FD_CD_HD = 0x231;

export const config = {
  autostart: true,
  bios: { url: "/Program Files/Virtual x86/bios/seabios.bin" },
  log_level: 0,
  network_relay_url: "wss://relay.widgetry.org/",
  vga_bios: { url: "/Program Files/Virtual x86/bios/vgabios.bin" },
  wasm_path: "/Program Files/Virtual x86/v86.wasm",
};

export const saveExtension = ".bin.save";
