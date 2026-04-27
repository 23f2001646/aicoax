import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AiCoax Mental Health Companion',
    short_name: 'AiCoax',
    description: 'Evidence-based mental health support, psychoeducation, and behavioral change tools — powered by AI, guided by ethics.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
