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

let HAS_WEB_GPU = false;

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

  if (!insufficientLimits) HAS_WEB_GPU = true;

  return !insufficientLimits;
};

export const useWebGPUCheck = (): boolean => {
  const [hasWebGPU, setHasWebGPU] = useState<boolean>(HAS_WEB_GPU);
  const checkWebGPU = useCallback(async () => {
    const sufficientLimits = await supportsWebGPU();

    if (sufficientLimits) setHasWebGPU(true);
  }, []);

  useEffect(() => {
    if (!hasWebGPU) requestAnimationFrame(checkWebGPU);
  }, [checkWebGPU, hasWebGPU]);

  return hasWebGPU;
};
