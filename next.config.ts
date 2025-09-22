import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Настройки для работы с Solana и Switchboard в браузере
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        util: require.resolve('util'),
        url: require.resolve('url'),
        assert: require.resolve('assert'),
      };
      
      // Игнорируем Node.js модули в Anchor
      config.externals = config.externals || [];
      config.externals.push({
        'node:fs': 'fs',
        'node:path': 'path',
        'node:os': 'os',
      });
    }
    return config;
  },
};

export default nextConfig;
