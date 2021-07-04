export const BOOT_CD_FD_HD = 0x213;
export const BOOT_FD_CD_HD = 0x231;

export const config = {
  autostart: true,
  log_level: 0,
  filesystem: {
    basefs: "/.index/fs.9p.json",
    baseurl: "/",
  },
  network_relay_url: "wss://relay.widgetry.org/",
  wasm_path: "/libs/v86/v86.wasm",
  bios: { url: "/libs/v86/bios/seabios.bin" },
  vga_bios: { url: "/libs/v86/bios/vgabios.bin" },
  memory_size: 1024 * 1024 * 1024,
  vga_memory_size: 32 * 1024 * 1024,
};

export const libs = ["/libs/v86/libv86.js"];
