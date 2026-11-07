/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // Linting runs through the ESLint CLI instead (`npm run build` runs
    // `npm run lint` first, which fails on any error or warning). Next's
    // built-in build lint uses the `next lint` code path removed in Next 16.
    // Type-checking during `next build` stays on.
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
