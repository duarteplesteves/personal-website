const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: new URL('..', import.meta.url).pathname }
};

export default nextConfig;
