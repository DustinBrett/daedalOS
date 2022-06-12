declare module "playlist-parser" {
  type PlaylistTrack = {
    artist?: string;
    file: string;
    length?: number;
    title?: string;
  };
  type Parser = {
    parse: (data: string) => PlaylistTrack[];
  };

  export const ASX: Parser;
  export const M3U: Parser;
  export const PLS: Parser;
}

declare module "butterchurn-presets";
