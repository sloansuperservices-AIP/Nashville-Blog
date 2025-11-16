
import React, { useState } from 'react';
import { SearchIcon } from './Icons';

interface KeywordInputProps {
    onScrape: (keywords: string) => void;
    isLoading: boolean;
}

export const KeywordInput: React.FC<KeywordInputProps> = ({ onScrape, isLoading }) => {
    const [keywords, setKeywords] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onScrape(keywords);
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-3 text-purple-300">Start Your Search</h2>
            <p className="text-gray-400 mb-4">Enter keywords to find the latest from Nashville's top blogs. Try "live music", "new restaurants", or "fall festivals".</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g., 'weekend events'"
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
                            Scraping...
                        </>
                    ) : (
                        <>
                            <SearchIcon />
                            Scrape Articles
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};
