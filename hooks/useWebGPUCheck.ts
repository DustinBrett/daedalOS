import { useCallback, useEffect, useState } from "react";

type GPUAdapter = {
  limits: {
    maxBufferSize: number;
    maxComputeWorkgroupStorageSize: number;
    maxStorageBufferBindingSize: number;
  };
};

type NavigatorWithGPU = Navigator & {
  gpu: {
    requestAdapter: () => Promise<GPUAdapter | null>;
  };
};

const supportsWebGPU = async (): Promise<boolean> => {
  if (typeof navigator === "undefined") return false;
  if (!("gpu" in navigator)) return false;

  let adapter: GPUAdapter | null;

  try {
    adapter = await (navigator as NavigatorWithGPU).gpu.requestAdapter();
  } catch {
    return false;
  }

  if (!adapter) return false;

  /* eslint-disable no-bitwise */
  const requiedMaxBufferSize = 1 << 30;
  const requiredMaxStorageBufferBindingSize = 1 << 30;
  const requiredMaxComputeWorkgroupStorageSize = 32 << 10;
  /* eslint-enable no-bitwise */

  const insufficientLimits =
    requiedMaxBufferSize > (adapter.limits.maxBufferSize ?? 0) ||
    requiredMaxStorageBufferBindingSize >
      (adapter.limits.maxStorageBufferBindingSize ?? 0) ||
    requiredMaxComputeWorkgroupStorageSize >
      (adapter.limits.maxComputeWorkgroupStorageSize ?? 0);

  return !insufficientLimits;
};

export const useWebGPUCheck = (): boolean | undefined => {
  const [hasWebGPU, setHasWebGPU] = useState<boolean | undefined>();
  const checkWebGPU = useCallback(
    async () => setHasWebGPU(await supportsWebGPU()),
    []
  );

  useEffect(() => {
    checkWebGPU();
  }, [checkWebGPU]);

  return hasWebGPU;
};
