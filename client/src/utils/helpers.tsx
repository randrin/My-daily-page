import config from "@/config";

export const isLocal = () =>
  typeof process !== "undefined" &&
  (config.env === "local" || config.env === "development");
