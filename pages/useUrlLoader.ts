import { useProcesses } from "contexts/process";
import { useEffect } from "react";

const useUrlLoader = (): void => {
  const { open } = useProcesses();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const app = searchParams.get("app");
    const url = searchParams.get("url");

    if (app && url) open(app, url);
  }, [open]);
};

export default useUrlLoader;
