
import React, { useState, useCallback } from 'react';
import { fetchObscureActivities } from '../services/geminiService';
import { ActivityResults, Event, RedditPost, GoogleAlert } from '../types';
import { LinkIcon, SearchIcon, SparklesIcon } from './Icons';

const ActivityCard: React.FC<{item: Event | RedditPost | GoogleAlert, type: 'event' | 'reddit' | 'alert'}> = ({ item, type }) => {
    
    const renderSourceInfo = () => {
        if (type === 'event') {
            const event = item as Event;
            return <span className="bg-green-800 text-green-200 text-xs font-bold mr-2 px-2.5 py-0.5 rounded-full">{event.source}</span>
        }
        if (type === 'reddit') {
            const post = item as RedditPost;
            return <span className="bg-orange-800 text-orange-200 text-xs font-bold mr-2 px-2.5 py-0.5 rounded-full">{post.subreddit}</span>
        }
        if (type === 'alert') {
            const alert = item as GoogleAlert;
            return <span className="bg-blue-800 text-blue-200 text-xs font-bold mr-2 px-2.5 py-0.5 rounded-full">{alert.source}</span>
        }
        return null;
    }

    return (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex flex-col hover:border-purple-500 transition-colors">
            <div className="flex-grow">
                <div className="flex items-center mb-2">
                    {renderSourceInfo()}
                     {'date' in item && <p className="text-sm text-gray-400 font-mono">{(item as Event).date}</p>}
                     {'author' in item && <p className="text-sm text-gray-400 font-mono">by {(item as RedditPost).author}</p>}
                </div>
                <h3 className="font-bold text-gray-100 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.summary}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 font-semibold">
                    <LinkIcon />
                    View Source
                </a>
            </div>
        </div>
    );
};

const SkeletonCard: React.FC = () => (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/4 mb-3"></div>
        <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6 mb-3"></div>
        <div className="h-8 border-t border-gray-700 mt-4 pt-3">
             <div className="h-4 bg-gray-700 rounded w-1/3"></div>
        </div>
    </div>
);

export const ActivityFinder: React.FC = () => {
    const [keywords, setKeywords] = useState<string>('');
    const [results, setResults] = useState<ActivityResults | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [initialLoad, setInitialLoad] = useState<boolean>(true);

    const handleSearch = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keywords.trim()) {
            setError("Please enter keywords to search.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setInitialLoad(false);
        try {
            const data = await fetchObscureActivities(keywords);
            setResults(data);
        } catch (err) {
            setError("Failed to find activities. The AI might be having a moment. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [keywords]);

    const renderResults = () => {
        if (isLoading) {
            return (
                <div className="mt-8 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-300">Events</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
                    </div>
                     <div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-300">From Reddit</h2>
                        <div className="grid md:grid-cols-2 gap-6"><SkeletonCard /><SkeletonCard /></div>
                    </div>
                     <div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-300">From Around The Web</h2>
                        <div className="grid md:grid-cols-2 gap-6"><SkeletonCard /><SkeletonCard /></div>
                    </div>
                </div>
            )
        }
        
        if (initialLoad) {
            return (
                <div className="mt-8 text-center bg-gray-800 border border-gray-700 p-10 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-300">Find Hidden Gems in Nashville</h3>
                    <p className="text-gray-400 mt-2">Use the search bar above to uncover unique, underground, and obscure events happening in the city.</p>
                </div>
            );
        }

        if (!results || (results.events.length === 0 && results.redditPosts.length === 0 && results.googleAlerts.length === 0)) {
            return (
                <div className="mt-8 text-center bg-gray-800 border border-gray-700 p-10 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-300">Nothing Found</h3>
                    <p className="text-gray-400 mt-2">The AI couldn't uncover any hidden gems for those keywords. Try something else!</p>
                </div>
            )
        }

        return (
            <div className="mt-8 space-y-12">
                {results.events.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-300 border-l-4 border-green-500 pl-3">Events (Eventbrite & Meetup)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.events.map(item => <ActivityCard key={item.link} item={item} type="event" />)}
                        </div>
                    </section>
                )}
                 {results.redditPosts.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-300 border-l-4 border-orange-500 pl-3">From Reddit</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {results.redditPosts.map(item => <ActivityCard key={item.link} item={item} type="reddit" />)}
                        </div>
                    </section>
                )}
                 {results.googleAlerts.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-gray-300 border-l-4 border-blue-500 pl-3">From Around The Web (Google Alerts)</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {results.googleAlerts.map(item => <ActivityCard key={item.link} item={item} type="alert" />)}
                        </div>
                    </section>
                )}
            </div>
        );
    }

    return (
        <div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-3 text-purple-300">Uncover Obscure Activities</h2>
                <p className="text-gray-400 mb-4">Search for pop-ups, secret shows, and unique gatherings. Try “Nashville pop-up,” “secret show Nashville,” or “weird.”</p>
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="e.g., 'underground music'"
                        className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold px-5 py-2 rounded-md hover:bg-purple-700 disabled:bg-purple-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {isLoading ? (
                             <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sleuthing...
                            </>
                        ) : (
                            <>
                                <SparklesIcon />
                                Find Activities
                            </>
                        )}
                    </button>
                </form>
            </div>
            {error && <p className="text-red-400 mt-4 bg-red-900/50 p-3 rounded-md">{error}</p>}
            {renderResults()}
        </div>
    );
};
