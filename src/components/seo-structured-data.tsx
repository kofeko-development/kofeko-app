import { absoluteUrl, siteUrl } from '@/lib/site';

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Kofeko',
      url: siteUrl,
      logo: absoluteUrl('/kofeko.svg'),
    },
    {
      '@type': 'WebSite',
      name: 'Kofeko',
      url: siteUrl,
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Kofeko',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: siteUrl,
      description:
        'Kofeko is a decision-first AI hiring platform for startups and SMBs. It helps teams structure roles, evaluate candidates with explainable AI, and make hiring decisions with greater clarity.',
    },
  ],
};

export default function SeoStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
