import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images:{ remotePatterns:[
    {protocol:'https',hostname: 'covers.openlibrary.org'},
    {protocol:'https',hostname: 'mrvws2pjv9fldcty.public.blob.vercel-storage.com'}
   ]

   },
   experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // adjust based on your largest expected PDF
    },
  }
};

export default nextConfig;
