/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    // Static export no puede usar Next.js image optimization server-side.
    // Se usa <img> con loading="lazy" decoding="async" directamente.
    unoptimized: true,
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Elimina X-Powered-By header
  poweredByHeader: false,
  // Compresión de respuestas (Gzip)
  compress: true,
  // Strict mode de React
  reactStrictMode: true,
  // Experimental: React Compiler cuando esté disponible
  experimental: {
    optimizePackageImports: ["@firebase/firestore", "mercadopago"],
  },
};

export default nextConfig;
