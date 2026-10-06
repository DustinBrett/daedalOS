import type * as FileSystemFunctions from "contexts/fileSystem/functions";
import type * as ImageDecoder from "utils/imageDecoder";
import type * as SpawnFly from "utils/spawnFly";
import type * as SpawnSheep from "utils/spawnSheep";
import type * as ZipFunctions from "utils/zipFunctions";

// Lazy imports shared by components and hooks, which React Compiler can't
// compile with an import() inside them
export const loadFileSystemFunctions = (): Promise<
  typeof FileSystemFunctions
> => import("contexts/fileSystem/functions");

export const loadImageDecoder = (): Promise<typeof ImageDecoder> =>
  import("utils/imageDecoder");

export const loadSpawnFly = (): Promise<typeof SpawnFly> =>
  import("utils/spawnFly");

export const loadSpawnSheep = (): Promise<typeof SpawnSheep> =>
  import("utils/spawnSheep");

export const loadZipFunctions = (): Promise<typeof ZipFunctions> =>
  import("utils/zipFunctions");
