
import React from 'react';
import { Article } from '../types';
import { BookmarkIcon, LinkIcon } from './Icons';

interface ArticleCardProps {
    article: Article;
    onSave: () => void;
    onUnsave: () => void;
    isSaved: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onSave, onUnsave, isSaved }) => {
    const imageUrl = `https://picsum.photos/seed/${article.id}/400/200`;
    
    const handleSaveClick = () => {
        if (isSaved) {
            onUnsave();
        } else {
            onSave();
        }
    }

    return (
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-700 hover:border-purple-500 transition-all duration-300">
            <img src={imageUrl} alt={article.title} className="w-full h-40 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex-grow">
                    <p className="text-sm text-purple-400 font-mono mb-1">{article.date}</p>
                    <h3 className="text-lg font-bold text-gray-100 mb-2 leading-tight">{article.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{article.summary}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 font-semibold"
                    >
                        <LinkIcon />
                        Read More
                    </a>
                    <button 
                      onClick={handleSaveClick}
                      className={`p-2 rounded-full transition-colors duration-200 ${isSaved ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                      aria-label={isSaved ? 'Unsave article' : 'Save article'}
                    >
                        <BookmarkIcon isSaved={isSaved} />
                    </button>
                </div>
            </div>
        </div>
    );
};
