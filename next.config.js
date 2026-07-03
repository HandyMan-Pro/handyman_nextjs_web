/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 
      (process.env.NODE_ENV === 'development' 
        ? 'http://127.0.0.1:8000' 
        : 'https://handyman-backend-cnxa.onrender.com');
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/?login=true',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/?register=true',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
