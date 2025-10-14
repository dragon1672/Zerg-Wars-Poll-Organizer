import React from 'react';
import type { Poll } from '../types';

interface FloatingPollCardProps {
    poll: Poll;
    x: number;
    y: number;
}

const FloatingPollCard: React.FC<FloatingPollCardProps> = ({ poll, x, y }) => {
    // Offset the card so the cursor doesn't directly hover over it,
    // which would interfere with detecting the drop target below.
    const style = { top: y + 10, left: x + 10 };

    return (
        <div
            style={style}
            className="fixed bg-white dark:bg-gray-700 p-3 rounded-xl shadow-2xl ring-2 ring-indigo-500 z-50 pointer-events-none w-72 opacity-90 transform -rotate-2"
        >
             {poll.threadTitle && (
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate mb-1 pb-1 border-b border-gray-200 dark:border-gray-600" title={poll.threadTitle}>
                    Thread: {poll.threadTitle}
                </p>
            )}
             <p className="flex-grow text-sm font-medium text-gray-800 dark:text-gray-200">
                {poll.description}
            </p>
                
            {poll.options && poll.options.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <ol className="list-decimal list-inside text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {poll.options.slice(0, 3).map(option => (
                            <li key={option.id} className="truncate">{option.text}</li>
                        ))}
                         {poll.options.length > 3 && (
                            <li className="text-xs text-gray-500 dark:text-gray-400 italic">...and {poll.options.length - 3} more</li>
                        )}
                    </ol>
                </div>
            )}
        </div>
    );
};

export default FloatingPollCard;