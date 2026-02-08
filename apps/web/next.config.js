/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
        root: '../../',
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: 'api.dicebear.com',
                port: '',
                pathname: '/7.x/**',
            },
        ],
    },
};

export default nextConfig;
