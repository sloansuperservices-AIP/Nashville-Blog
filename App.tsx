
import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { KeywordInput } from './components/KeywordInput';
import { BlogSection } from './components/BlogSection';
import { SavedArticlesPane } from './components/SavedArticlesPane';
import { ActivityFinder } from './components/ActivityFinder';
import { fetchBlogArticles } from './services/geminiService';
import { Article } from './types';
import { BLOGS } from './constants';

type Tab = 'blog' | 'activity';

const App: React.FC = () => {
    const [articlesByBlog, setArticlesByBlog] = useState<Record<string, Article[]>>({});
    const [savedArticles, setSavedArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [initialLoad, setInitialLoad] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<Tab>('blog');

    const handleScrape = useCallback(async (keywords: string) => {
        if (!keywords.trim()) {
            setError("Please enter keywords to search.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setInitialLoad(false);

        try {
            const result = await fetchBlogArticles(BLOGS, keywords);
            const articlesWithIds = Object.entries(result).reduce((acc, [blogName, articles]) => {
                acc[blogName] = articles.map((article, index) => ({
                    ...article,
                    id: `${blogName.replace(/\s+/g, '-')}-${index}-${Date.now()}`,
                    source: blogName,
                }));
                return acc;
            }, {} as Record<string, Article[]>);

            setArticlesByBlog(articlesWithIds);
        } catch (e) {
            console.error(e);
            setError("Failed to fetch articles. The AI might be busy. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSaveArticle = useCallback((articleToSave: Article) => {
        setSavedArticles(prev => {
            if (prev.find(a => a.id === articleToSave.id)) {
                return prev;
            }
            return [...prev, articleToSave];
        });
    }, []);

    const handleUnsaveArticle = useCallback((articleId: string) => {
        setSavedArticles(prev => prev.filter(a => a.id !== articleId));
    }, []);

    const savedArticleIds = useMemo(() => new Set(savedArticles.map(a => a.id)), [savedArticles]);
    
    const TabButton: React.FC<{tabId: Tab; label: string}> = ({ tabId, label }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tabId ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="mb-6 bg-gray-800 border border-gray-700 p-2 rounded-lg inline-flex space-x-2">
                    <TabButton tabId="blog" label="Blog Hub" />
                    <TabButton tabId="activity" label="Activity Finder" />
                </div>

                {activeTab === 'blog' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8">
                            <KeywordInput onScrape={handleScrape} isLoading={isLoading} />
                            {error && <p className="text-red-400 mt-4 bg-red-900/50 p-3 rounded-md">{error}</p>}
                            <BlogSection
                                articlesByBlog={articlesByBlog}
                                isLoading={isLoading}
                                initialLoad={initialLoad}
                                onSaveArticle={handleSaveArticle}
                                onUnsaveArticle={handleUnsaveArticle}
                                savedArticleIds={savedArticleIds}
                            />
                        </div>
                        <div className="lg:col-span-4">
                            <SavedArticlesPane
                                savedArticles={savedArticles}
                                onUnsaveArticle={handleUnsaveArticle}
                            />
                        </div>
                    </div>
                )}
                
                {activeTab === 'activity' && (
                    <ActivityFinder />
                )}
            </main>
        </div>
    );
};

export default App;
