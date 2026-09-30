import { withFluxFast } from "@fluxfast/next/next-config";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@fluxfast/core", "@fluxfast/next"],
};

export default withFluxFast(nextConfig);
