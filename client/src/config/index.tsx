import dotenv from "dotenv";

dotenv.config();

const config = {
  HOST_CLIENT: process.env.NEXT_PUBLIC_HOST_CLIENT,
  HOST_SERVER: process.env.NEXT_PUBLIC_HOST_SERVER,
};

export default config;
