/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization - allow external image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  // Security
  poweredByHeader: false,

  // Mongoose runs server-side only
  serverExternalPackages: ['mongoose'],
};

export default nextConfig;
