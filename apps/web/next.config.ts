import type { NextConfig } from "next";
import "./src/env";

const nextConfig: NextConfig = {
	transpilePackages: ["@repo/api-client", "@repo/ui", "@repo/validators"],
};

export default nextConfig;
