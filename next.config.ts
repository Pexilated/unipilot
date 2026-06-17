import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Required for pdf-parse to work in Next.js API routes
  serverExternalPackages: ['pdf-parse'],

  // Allow images from Supabase storage (for future avatar/image features)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
