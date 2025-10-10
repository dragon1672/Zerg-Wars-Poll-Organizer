
import React from 'react';
import type { Poll } from '../types';

interface PollCardProps {
    poll: Poll;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
}

const PollCard: React.FC<PollCardProps> = ({ poll, onEdit, onDelete, onDuplicate }) => {
    return (
        <div data-poll-id={poll.id} className="bg-white p-3 m-1 rounded-xl shadow-md cursor-grab hover:shadow-lg hover:ring-2 hover:ring-indigo-400 transition-shadow">
            <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-800 w-10/12 cursor-pointer hover:text-indigo-600 transition" onClick={() => onEdit(poll.id)}>
                    {poll.description}
                </p>
                <div className="flex flex-col items-center ml-2 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); onDuplicate(poll.id); }} className="text-indigo-500 hover:text-indigo-700 p-1 rounded-full hover:bg-indigo-50 transition" title="Duplicate Poll">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h.01M16 7h.01M16 7v8a2 2 0 002 2h2a2 2 0 002-2v-4"></path></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(poll.id); }} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition mt-2" title="Delete Poll">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
            {poll.options && poll.options.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                    <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1">
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
