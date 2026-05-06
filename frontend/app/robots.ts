import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/authority', '/test'],
    },
    sitemap: 'https://mahfoozai.netlify.app/sitemap.xml', // Replace with your actual domain when deploying
  };
}
