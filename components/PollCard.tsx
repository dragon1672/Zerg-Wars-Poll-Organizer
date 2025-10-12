import React from 'react';
import type { Poll } from '../types';

interface PollCardProps {
    poll: Poll;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onArchive: (id: string) => void;
}

const PollCard: React.FC<PollCardProps> = ({ poll, onEdit, onDelete, onDuplicate, onArchive }) => {
    return (
        <div data-poll-id={poll.id} className="bg-white dark:bg-gray-700 p-3 m-1 rounded-xl shadow-md cursor-grab hover:shadow-lg hover:ring-2 hover:ring-indigo-400 dark:hover:ring-indigo-500 transition-shadow">
            <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 w-10/12 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition" onClick={() => onEdit(poll.id)}>
                    {poll.description}
                </p>
                <div className="flex flex-col items-center ml-2 flex-shrink-0 space-y-2">
                    <button onClick={(e) => { e.stopPropagation(); onDuplicate(poll.id); }} className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-600 transition" title="Duplicate Poll">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h.01M16 7h.01M16 7v8a2 2 0 002 2h2a2 2 0 002-2v-4"></path></svg>
                    </button>
                     <button onClick={(e) => { e.stopPropagation(); onArchive(poll.id); }} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition" title="Archive Poll">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h14"></path></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(poll.id); }} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-gray-600 transition" title="Delete Poll">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
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