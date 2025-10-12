import React, { useState, useEffect, useRef } from 'react';
import type { Poll } from '../types';

interface PollCardProps {
    poll: Poll;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onArchive: (id: string) => void;
}

const PollCard: React.FC<PollCardProps> = ({ poll, onEdit, onDelete, onDuplicate, onArchive }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = (action: (id: string) => void) => (e: React.MouseEvent) => {
        e.stopPropagation();
        action(poll.id);
        setIsMenuOpen(false);
    };

    return (
        <div data-poll-id={poll.id} className="bg-white dark:bg-gray-700 p-3 m-1 rounded-xl shadow-md cursor-grab hover:shadow-lg hover:ring-2 hover:ring-indigo-400 dark:hover:ring-indigo-500 transition-shadow">
            <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 w-10/12 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition" onClick={() => onEdit(poll.id)}>
                    {poll.description}
                </p>
                
                {/* Dropdown Menu */}
                <div className="relative ml-2 flex-shrink-0" ref={menuRef}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(prev => !prev); }} 
                        className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        aria-haspopup="true"
                        aria-expanded={isMenuOpen}
                        title="More options"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1" role="menu" aria-orientation="vertical">
                                <button onClick={handleAction(onDuplicate)} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <svg className="w-5 h-5 mr-3 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h.01M16 7h.01M16 7v8a2 2 0 002 2h2a2 2 0 002-2v-4"></path></svg>
                                    <span>Duplicate</span>
                                </button>
                                <button onClick={handleAction(onArchive)} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <svg className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h14"></path></svg>
                                    <span>Archive</span>
                                </button>
                                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                <button onClick={handleAction(onDelete)} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {poll.options && poll.options.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <ol className="list-decimal list-inside text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {poll.options.map(option => (
                            <li key={option.id} className="truncate">{option.text}</li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
};

export default PollCard;
