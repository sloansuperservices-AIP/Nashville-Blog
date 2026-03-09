
import React from 'react';
import { Article } from '../types';
import { BookmarkIcon, TrashIcon, RssIcon } from './Icons';
import { generateRssFeed } from '../services/rssService';

interface SavedArticlesPaneProps {
    savedArticles: Article[];
    onUnsaveArticle: (articleId: string) => void;
}

export const SavedArticlesPane: React.FC<SavedArticlesPaneProps> = ({ savedArticles, onUnsaveArticle }) => {
    const handleDownloadRss = () => {
        const rssContent = generateRssFeed(savedArticles);
        const blob = new Blob([rssContent], { type: 'application/rss+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'my-saved-articles.xml';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <aside className="sticky top-24">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-purple-300 flex items-center gap-2">
                        <BookmarkIcon isSaved={true} />
                        My Weekly List
                    </h2>
                    {savedArticles.length > 0 && (
                        <button
                            onClick={handleDownloadRss}
                            className="text-gray-400 hover:text-orange-400 transition-colors p-1"
                            title="Export RSS Feed"
                        >
                            <RssIcon />
                        </button>
                    )}
                </div>
                {savedArticles.length > 0 ? (
                    <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {savedArticles.map(article => (
                            <li 
                                key={article.id} 
                                className="flex items-start justify-between gap-2 p-3 bg-gray-900 rounded-md border border-gray-700"
                            >
                                <div className="flex-1">
                                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-200 hover:text-purple-400 transition-colors text-sm leading-snug">
                                        {article.title}
                                    </a>
                                    <p className="text-xs text-gray-500 font-mono mt-1">{article.source}</p>
                                </div>
                                <button 
                                    onClick={() => onUnsaveArticle(article.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/50 rounded-full transition-colors"
                                    aria-label="Remove saved article"
                                >
                                    <TrashIcon />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 text-sm text-center py-6">
                        Click the bookmark icon on any article to save it here for your weekly reading list.
                    </p>
                )}
            </div>
        </aside>
    );
};
