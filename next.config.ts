import type { NextConfig } from "next";
import { validateEnvironmentVariables } from "./lib/env.validation";

// Validate environment variables at build time
validateEnvironmentVariables();

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
