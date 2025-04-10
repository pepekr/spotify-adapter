/** @type {import('next').NextConfig} */
const nextConfig = {
  //  reactStrictMode: false,
  // Додаємо функцію rewrites для перенаправлення API-запитів
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Всі запити, що починаються з /api/
        destination: 'http://192.168.0.104:3000/api/:path*', // Замінити 192.168.1.100 на IP-адресу комп’ютера
      },
    ];
  },
};

export default nextConfig;
