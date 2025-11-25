/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // TODO: Corrigir erros de TypeScript
  },
  images: {
    unoptimized: true,
    domains: ['dailyquest-api.onrender.com'], // Adicionar domínio do backend
  },
  // Remover output: 'standalone' para deploy na Vercel
  // A Vercel usa seu próprio sistema de build
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
