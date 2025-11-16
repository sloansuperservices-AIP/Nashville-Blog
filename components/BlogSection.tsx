
import React from 'react';
import { Article } from '../types';
import { BLOGS } from '../constants';
import { ArticleCard } from './ArticleCard';

interface BlogSectionProps {
    articlesByBlog: Record<string, Article[]>;
    isLoading: boolean;
    initialLoad: boolean;
    onSaveArticle: (article: Article) => void;
    onUnsaveArticle: (articleId: string) => void;
    savedArticleIds: Set<string>;
}

const SkeletonCard: React.FC = () => (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="h-40 bg-gray-700"></div>
        <div className="p-4">
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
    </div>
);

export const BlogSection: React.FC<BlogSectionProps> = ({
    articlesByBlog,
    isLoading,
    initialLoad,
    onSaveArticle,
    onUnsaveArticle,
    savedArticleIds,
}) => {
    if (isLoading) {
        return (
            <div className="mt-8">
                {BLOGS.map(blog => (
                    <div key={blog.name} className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-gray-300 border-l-4 border-purple-500 pl-3">{blog.name}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (initialLoad) {
        return (
            <div className="mt-8 text-center bg-gray-800 border border-gray-700 p-10 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-300">Welcome to the Nashville Blog Hub</h3>
                <p className="text-gray-400 mt-2">Enter some keywords above to begin your discovery of Nashville's latest happenings!</p>
            </div>
        );
    }
    
    if (!isLoading && Object.keys(articlesByBlog).length === 0 && !initialLoad) {
        return (
             <div className="mt-8 text-center bg-gray-800 border border-gray-700 p-10 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-300">No Articles Found</h3>
                <p className="text-gray-400 mt-2">The AI couldn't find any articles for your keywords. Try being more general or check for typos.</p>
            </div>
        )
    }

    return (
        <div className="mt-8 space-y-12">
            {Object.entries(articlesByBlog).map(([blogName, articles]) => (
                <div key={blogName}>
                    <h2 className="text-2xl font-bold mb-4 text-gray-300 border-l-4 border-purple-500 pl-3">{blogName}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* FIX: Add an Array.isArray check to ensure articles is an array before mapping. This resolves the TypeScript error where 'articles' was inferred as 'unknown'. */}
                        {Array.isArray(articles) && articles.map((article) => (
                            <ArticleCard
                                key={article.id}
                                article={article}
                                onSave={() => onSaveArticle(article)}
                                onUnsave={() => onUnsaveArticle(article.id)}
                                isSaved={savedArticleIds.has(article.id)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
