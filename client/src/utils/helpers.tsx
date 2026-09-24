export const isLocal = () => {
  const env = process.env.NEXT_PUBLIC_ENV;
  return env === "local" || env === "development";
};

export const firstLetterUppercase = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};
