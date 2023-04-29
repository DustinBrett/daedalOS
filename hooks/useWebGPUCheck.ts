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

  const adapter = await (navigator as NavigatorWithGPU).gpu.requestAdapter();

  if (!adapter) return false;

  /* eslint-disable no-bitwise */
  const requiedMaxBufferSize = 1 << 30;
  const requiredMaxStorageBufferBindingSize = 1 << 30;
  const requiredMaxComputeWorkgroupStorageSize = 32 << 10;
  /* eslint-enable no-bitwise */

  const insufficientLimits =
    requiedMaxBufferSize > adapter.limits.maxBufferSize ||
    requiredMaxStorageBufferBindingSize >
      adapter.limits.maxStorageBufferBindingSize ||
    requiredMaxComputeWorkgroupStorageSize >
      adapter.limits.maxComputeWorkgroupStorageSize;

  return !insufficientLimits;
};

export const useWebGPUCheck = (): boolean => {
  const [hasWebGPU, setHasWebGPU] = useState(false);
  const checkWebGPU = useCallback(
    async () => setHasWebGPU(await supportsWebGPU()),
    []
  );

  useEffect(() => {
    checkWebGPU();
  }, [checkWebGPU]);

  return hasWebGPU;
};
