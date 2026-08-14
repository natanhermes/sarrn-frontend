import type { NextConfig } from "next";

function apiRemotePatterns(): NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return [];
  }

  try {
    const { protocol, hostname, port } = new URL(apiUrl);
    const normalizedProtocol = protocol.replace(":", "") as "http" | "https";

    return [
      {
        protocol: normalizedProtocol,
        hostname,
        ...(port ? { port } : {}),
        pathname: "/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["jsdom"],
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      ...apiRemotePatterns(),
      {
        protocol: "https",
        hostname: "sarrn-storage.sfo3.digitaloceanspaces.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.digitaloceanspaces.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
