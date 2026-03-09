import { Article } from '../types';

const escapeXml = (unsafe: string): string => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

export const generateRssFeed = (articles: Article[]): string => {
    const items = articles.map(article => {
        const dateStr = article.date;
        const date = new Date(dateStr);
        const pubDate = isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
        const link = escapeXml(article.link);
        const source = escapeXml(article.source);
        // title and description are wrapped in CDATA, so they don't strictly need escaping,
        // but CDATA end sequence ']]>' must be handled if it appears in content.
        // For now assuming titles/summaries don't contain ']]>'.

        return `
        <item>
            <title><![CDATA[${article.title}]]></title>
            <link>${link}</link>
            <description><![CDATA[${article.summary}]]></description>
            <pubDate>${pubDate}</pubDate>
            <source url="${link}">${source}</source>
            <guid>${article.id}</guid>
        </item>`;
    }).join('');

    const channelLink = typeof window !== 'undefined' ? escapeXml(window.location.href) : 'https://example.com';

    return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
    <channel>
        <title>My Saved Articles</title>
        <description>Articles saved from the blog aggregator.</description>
        <link>${channelLink}</link>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${items}
    </channel>
</rss>`;
};
