import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url }) => {
  const siteTitle = 'Sipalaya Info Tech - Best IT Training Institute in Nepal';
  const fullTitle = title ? `${title} | Sipalaya IT` : siteTitle;
  const defaultDesc = 'Sipalaya Info Tech is the leading IT training institute in Nepal, offering courses in Web Development, Data Science, Python, UI/UX, and more with 100% placement assistance.';
  const metaDesc = description || defaultDesc;
  const siteUrl = 'https://sipalaya.com'; // Change to actual URL
  const metaUrl = url ? `${siteUrl}${url}` : siteUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={metaUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={metaDesc} />
      {image && <meta property="twitter:image" content={image} />}
      
      {/* Canonical Link */}
      <link rel="canonical" href={metaUrl} />
    </Helmet>
  );
};

export default SEO;
