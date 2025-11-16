
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700">
            <div className="container mx-auto px-4 md:px-8 py-4">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    Nashville <span className="text-purple-400">Blog Hub</span>
                </h1>
                <p className="text-gray-400 text-sm mt-1">AI-Powered Weekly Article Aggregator</p>
            </div>
        </header>
    );
};
