import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // для docker: собирается минимальный server.js со всеми зависимостями
  output: 'standalone',
  poweredByHeader: false,
  // корень проекта - эта папка (иначе next ищет lockfile выше по дереву)
  turbopack: { root: fileURLToPath(new URL('.', import.meta.url)) },
};

export default nextConfig;
