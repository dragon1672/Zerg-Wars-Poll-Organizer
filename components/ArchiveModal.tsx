import React, { useState, useMemo } from 'react';
import type { Poll, Category } from '../types';

interface ArchiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    polls: Poll[];
    categories: Category[];
    onUnarchive: (pollId: string) => void;
    onDelete: (pollId: string) => void;
    onBulkUnarchive: (pollIds: string[]) => void;
    onBulkDelete: (pollIds: string[]) => void;
}

const ArchiveModal: React.FC<ArchiveModalProps> = ({ isOpen, onClose, polls, categories, onUnarchive, onDelete, onBulkUnarchive, onBulkDelete }) => {
    const [selectedPollIds, setSelectedPollIds] = useState<Set<string>>(new Set());

    const categoryMap = useMemo(() => new Map(categories.map(cat => [cat.id, cat])), [categories]);
    const allPollIds = useMemo(() => polls.map(p => p.id), [polls]);

    if (!isOpen) return null;

    const handleSelect = (pollId: string) => {
        setSelectedPollIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(pollId)) {
                newSet.delete(pollId);
            } else {
                newSet.add(pollId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedPollIds.size === allPollIds.length) {
            setSelectedPollIds(new Set());
        } else {
            setSelectedPollIds(new Set(allPollIds));
        }
    };

    const handleBulkUnarchiveClick = () => {
        onBulkUnarchive(Array.from(selectedPollIds));
        setSelectedPollIds(new Set());
    };

    const handleBulkDeleteClick = () => {
        onBulkDelete(Array.from(selectedPollIds));
        setSelectedPollIds(new Set());
    };
    
    const isAllSelected = selectedPollIds.size > 0 && selectedPollIds.size === allPollIds.length;
    const isSelectionEmpty = selectedPollIds.size === 0;

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-start bg-black bg-opacity-50 overflow-y-auto p-4 pt-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-11/12 max-w-3xl my-8 transform transition-all duration-300">
                <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Archived Polls ({polls.length})</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                         <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {polls.length > 0 && (
                    <div className="p-3 mb-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="select-all-archived"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                            />
                            <label htmlFor="select-all-archived" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Select All ({selectedPollIds.size} selected)
                            </label>
                        </div>
                        <div className="flex-shrink-0 space-x-2">
                             <button onClick={handleBulkUnarchiveClick} disabled={isSelectionEmpty} className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600">Unarchive Selected</button>
                             <button onClick={handleBulkDeleteClick} disabled={isSelectionEmpty} className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600">Delete Selected</button>
                        </div>
                    </div>
                )}

                <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1">
                    {polls.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No archived polls.</p>
                    ) : (
                        polls.map(poll => {
                            const category = categoryMap.get(poll.category);
                            return (
                                <div key={poll.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600 flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                                        checked={selectedPollIds.has(poll.id)}
                                        onChange={() => handleSelect(poll.id)}
                                    />
                                    <div className="flex-grow">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{poll.description}</p>
                                        {category && (
                                            <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${category.color} dark:bg-opacity-40 text-gray-800 dark:text-gray-200 border ${category.border} border-opacity-50`}>
                                                {category.title}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-shrink-0 space-x-2">
                                        <button onClick={() => onUnarchive(poll.id)} className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition">Unarchive</button>
                                        <button onClick={() => onDelete(poll.id)} className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition">Delete</button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="flex justify-end mt-4 border-t dark:border-gray-700 pt-4">
                     <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Close</button>
                </div>
            </div>
        </div>
    );
};

export default ArchiveModal;