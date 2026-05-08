/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Render free tier, SSR for Netlify/Vercel
  output: process.env.STATIC_EXPORT === 'true' ? 'export' : undefined,
  images: {
    unoptimized: process.env.STATIC_EXPORT === 'true',
  },
};

export default nextConfig;
