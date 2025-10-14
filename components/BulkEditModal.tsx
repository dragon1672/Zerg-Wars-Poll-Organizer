import React, { useState, useMemo } from 'react';
import type { Poll } from '../types';

interface BulkEditModalProps {
    polls: Poll[];
    allTags: string[];
    onClose: () => void;
    onSave: (changes: { selectedPollIds: string[], tagsToAdd: string[], tagsToRemove: string[] }) => void;
}

const TagManager: React.FC<{
    title: string;
    tags: string[];
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
    allTags: string[];
    verb: string;
    color: 'purple' | 'red';
}> = ({ title, tags, onAddTag, onRemoveTag, allTags, verb, color }) => {
    const [input, setInput] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            onAddTag(input);
            setInput('');
        }
    };

    const colorClasses = {
        bg: `bg-${color}-100 dark:bg-${color}-900/50`,
        text: `text-${color}-800 dark:text-${color}-200`,
        button: `text-${color}-500 hover:text-${color}-700 dark:text-${color}-400 dark:hover:text-${color}-300`,
    };

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700 space-y-3">
            <h3 className="font-semibold dark:text-gray-200">{title}</h3>
            <div className="flex flex-wrap gap-2 min-h-[34px]">
                {tags.map(tag => (
                    <div key={tag} className={`flex items-center ${colorClasses.bg} ${colorClasses.text} text-sm font-medium px-2.5 py-1 rounded-full`}>
                        <span>{tag}</span>
                        <button type="button" onClick={() => onRemoveTag(tag)} className={`ml-2 ${colorClasses.button}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                ))}
            </div>
            <input
                type="text"
                list="all-tags-list-bulk"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Tag to ${verb}... (press Enter)`}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            />
            <datalist id="all-tags-list-bulk">
                {allTags.map(tag => <option key={tag} value={tag} />)}
            </datalist>
        </div>
    );
};

const BulkEditModal: React.FC<BulkEditModalProps> = ({ polls, allTags, onClose, onSave }) => {
    const [selectedPollIds, setSelectedPollIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [tagsToAdd, setTagsToAdd] = useState<string[]>([]);
    const [tagsToRemove, setTagsToRemove] = useState<string[]>([]);

    const filteredPolls = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        if (!lowercasedQuery) return polls;
        return polls.filter(poll => 
            poll.description.toLowerCase().includes(lowercasedQuery) ||
            poll.options.some(opt => opt.text.toLowerCase().includes(lowercasedQuery))
        );
    }, [polls, searchQuery]);
    
    const togglePollSelection = (pollId: string) => {
        setSelectedPollIds(prev => {
            const newSet = new Set(prev);
            newSet.has(pollId) ? newSet.delete(pollId) : newSet.add(pollId);
            return newSet;
        });
    };
    
    const handleSelectAllShown = () => setSelectedPollIds(new Set(filteredPolls.map(p => p.id)));
    const handleDeselectAll = () => setSelectedPollIds(new Set());
    const handleInvertSelection = () => {
        const shownIds = new Set(filteredPolls.map(p => p.id));
        setSelectedPollIds(prev => {
            const newSet = new Set<string>();
            shownIds.forEach(id => {
                if (!prev.has(id)) {
                    newSet.add(id);
                }
            });
            return newSet;
        });
    };
    
    const handleAddTag = (tag: string) => {
        const newTag = tag.trim().toLowerCase();
        if (newTag && !tagsToAdd.includes(newTag)) {
            setTagsToAdd(prev => [...prev, newTag].sort());
            setTagsToRemove(prev => prev.filter(t => t !== newTag));
        }
    };

    const handleRemoveTagFromAddList = (tag: string) => {
        setTagsToAdd(prev => prev.filter(t => t !== tag));
    };
    
    const handleRemoveTag = (tag: string) => {
        const newTag = tag.trim().toLowerCase();
        if (newTag && !tagsToRemove.includes(newTag)) {
            setTagsToRemove(prev => [...prev, newTag].sort());
            setTagsToAdd(prev => prev.filter(t => t !== newTag));
        }
    };
    
    const handleRemoveTagFromRemoveList = (tag: string) => {
        setTagsToRemove(prev => prev.filter(t => t !== tag));
    };

    const handleSaveClick = () => {
        if (selectedPollIds.size === 0) {
            alert('Please select at least one poll to edit.');
            return;
        }
        if (tagsToAdd.length === 0 && tagsToRemove.length === 0) {
            alert('Please specify at least one tag to add or remove.');
            return;
        }
        onSave({
            // FIX: Use spread syntax to convert the Set to an array. This ensures correct type inference to `string[]` and resolves the error.
            selectedPollIds: [...selectedPollIds],
            tagsToAdd,
            tagsToRemove,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-60 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                <header className="p-4 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Bulk Edit Tags</h2>
                </header>

                <main className="flex-grow flex flex-col md:flex-row gap-4 p-4 min-h-0">
                    {/* Left Column: Filtering and Selection */}
                    <div className="md:w-3/5 flex flex-col gap-4">
                        <input
                            type="search"
                            placeholder="Filter polls by description or options..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                        />
                        <div className="flex-grow flex flex-col min-h-0 border dark:border-gray-700 rounded-lg">
                            <div className="p-2 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 rounded-t-lg">
                                <p className="font-semibold text-sm">{filteredPolls.length} polls shown ({selectedPollIds.size} selected)</p>
                                <div className="space-x-2">
                                    <button onClick={handleSelectAllShown} className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Select All</button>
                                    <button onClick={handleDeselectAll} className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Deselect All</button>
                                    <button onClick={handleInvertSelection} className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Invert</button>
                                </div>
                            </div>
                            <div className="flex-grow overflow-y-auto p-2">
                                {filteredPolls.map(poll => (
                                    <label key={poll.id} className="flex items-start p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer">
                                        <input type="checkbox" checked={selectedPollIds.has(poll.id)} onChange={() => togglePollSelection(poll.id)} className="mt-1 mr-3 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                                        <div className="flex-grow">
                                            <p className="text-sm font-medium dark:text-gray-200">{poll.description}</p>
                                             {poll.tags && poll.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {poll.tags.map(tag => (
                                                        <span key={tag} className="px-1.5 py-0.5 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full dark:bg-purple-900/50 dark:text-purple-300">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Column: Edit Actions */}
                    <div className="md:w-2/5 flex flex-col gap-4">
                        <TagManager 
                            title="Add these tags:"
                            tags={tagsToAdd}
                            onAddTag={handleAddTag}
                            onRemoveTag={handleRemoveTagFromAddList}
                            allTags={allTags}
                            verb="add"
                            color="purple"
                        />
                         <TagManager 
                            title="Remove these tags:"
                            tags={tagsToRemove}
                            onAddTag={handleRemoveTag}
                            onRemoveTag={handleRemoveTagFromRemoveList}
                            allTags={allTags}
                            verb="remove"
                            color="red"
                        />
                         <div className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg border border-blue-300 dark:border-blue-700 mt-auto">
                            <h3 className="font-bold text-blue-800 dark:text-blue-200">Summary</h3>
                            <p className="text-sm mt-1 text-blue-700 dark:text-blue-300">
                                You will edit <span className="font-bold">{selectedPollIds.size}</span> poll(s).
                            </p>
                        </div>
                    </div>
                </main>

                <footer className="p-4 border-t dark:border-gray-700 flex justify-end items-center gap-3 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"> Cancel </button>
                    <button onClick={handleSaveClick} className="px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-700 shadow-md transition flex items-center gap-2">
                        Apply Changes
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default BulkEditModal;