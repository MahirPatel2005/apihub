import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords }) => {
    const siteTitle = 'API Hub';
    const finalTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const finalDescription = description || 'Discover, share, and manage the best APIs in one place. Your central hub for API discovery.';
    const finalKeywords = keywords || 'API, developer, rest api, graphql, api directory, coding';

    return (
        <Helmet>
            <title>{finalTitle}</title>
            <meta name="description" content={finalDescription} />
            <meta name="keywords" content={finalKeywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDescription} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:title" content={finalTitle} />
            <meta property="twitter:description" content={finalDescription} />
        </Helmet>
    );
};

export default SEO;
