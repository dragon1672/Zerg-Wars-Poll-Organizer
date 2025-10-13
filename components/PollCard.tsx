import React from 'react';
import type { Poll } from '../types';

interface PollCardProps {
    poll: Poll;
    onMouseDown: (event: React.MouseEvent, pollId: string) => void;
    onContextMenu: (event: React.MouseEvent, poll: Poll) => void;
    isStickied: boolean;
    onDuplicate: (pollId: string) => void;
    onDelete: (pollId: string) => void;
}

const PollCard: React.FC<PollCardProps> = ({ poll, onMouseDown, onContextMenu, isStickied, onDuplicate, onDelete }) => {

    if (isStickied) {
        return (
            <div className="bg-gray-200 dark:bg-gray-600 p-3 m-1 rounded-xl shadow-inner border-2 border-dashed border-gray-400 dark:border-gray-500 h-[78px] animate-pulse">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Moving poll...</p>
            </div>
        );
    }

    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDuplicate(poll.id);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(poll.id);
    };
    
    return (
        <div 
            data-poll-id={poll.id} 
            className="group bg-white dark:bg-gray-700 p-3 m-1 rounded-xl shadow-md cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-indigo-400 dark:hover:ring-indigo-500 transition-shadow relative"
            onMouseDown={(e) => onMouseDown(e, poll.id)}
            onContextMenu={(e) => {
                e.stopPropagation(); // Prevent parent context menus
                onContextMenu(e, poll);
            }}
        >
            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <button 
                    onClick={handleDuplicate} 
                    title="Duplicate Poll"
                    className="p-1 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-500 hover:text-indigo-600 dark:hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
                <button 
                    onClick={handleDelete} 
                    title="Delete Poll"
                    className="p-1 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-500 hover:text-red-600 dark:hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>

            <p className="flex-grow text-sm font-medium text-gray-800 dark:text-gray-200 pr-8">
                {poll.description}
            </p>
                
            {poll.options && poll.options.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 pointer-events-none">
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
