import React from 'react';
import type { Poll } from '../types';

interface PollCardProps {
    poll: Poll;
    onMouseDown: (event: React.MouseEvent, pollId: string) => void;
    onContextMenu: (event: React.MouseEvent, poll: Poll) => void;
    isStickied: boolean;
}

const PollCard: React.FC<PollCardProps> = ({ poll, onMouseDown, onContextMenu, isStickied }) => {

    if (isStickied) {
        return (
            <div className="bg-gray-200 dark:bg-gray-600 p-3 m-1 rounded-xl shadow-inner border-2 border-dashed border-gray-400 dark:border-gray-500 h-[78px] animate-pulse">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Moving poll...</p>
            </div>
        );
    }
    
    return (
        <div 
            data-poll-id={poll.id} 
            className="bg-white dark:bg-gray-700 p-3 m-1 rounded-xl shadow-md cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-indigo-400 dark:hover:ring-indigo-500 transition-shadow relative"
            onMouseDown={(e) => onMouseDown(e, poll.id)}
            onContextMenu={(e) => {
                e.stopPropagation(); // Prevent parent context menus
                onContextMenu(e, poll);
            }}
        >
            <p className="flex-grow text-sm font-medium text-gray-800 dark:text-gray-200">
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