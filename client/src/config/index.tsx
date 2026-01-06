import dotenv from "dotenv";

dotenv.config();

const config = {
  app_name: process.env.NEXT_PUBLIC_APP_NAME,
  host_client: process.env.NEXT_PUBLIC_HOST_CLIENT,
  host_server: process.env.NEXT_PUBLIC_HOST_SERVER,
  env: process.env.NEXT_PUBLIC_ENV
};

export default config;
