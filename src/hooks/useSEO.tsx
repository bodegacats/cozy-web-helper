import { Helmet } from 'react-helmet';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  canonical?: string;
  schema?: Record<string, any> | Record<string, any>[];
}

const DEFAULT_TITLE = 'Build Me a Simple Site | Simple websites for small businesses and solo projects';
const DEFAULT_DESCRIPTION = 'One person website service that builds 5–7 page sites for small businesses and solo projects in about a week. Flat pricing, clear scope, and tiny fixes included.';
const DEFAULT_IMAGE = 'https://buildmeasimplesite.com/og-image.jpg';
const BASE_URL = 'https://buildmeasimplesite.com';
const SITE_NAME = 'Build Me a Simple Site';

export function useSEO(props: SEOProps = {}) {
  const {
    title = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
    keywords = [],
    image = DEFAULT_IMAGE,
    url = BASE_URL,
    type = 'website',
    author = 'Dan Mulé',
    publishedTime,
    modifiedTime,
    noindex = false,
    canonical,
    schema,
  } = props;

  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const canonicalUrl = canonical || fullUrl;
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="author" content={author} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* Article specific OG tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:creator" content="@buildmeasimple" />
      <meta name="twitter:site" content="@buildmeasimple" />

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

export default useSEO;
