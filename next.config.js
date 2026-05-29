/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  async redirects() {
    return [
      {
        source: "/:path+/",
        destination: "/:path+",
        permanent: true
      }
    ];
  }
};

module.exports = nextConfig;
