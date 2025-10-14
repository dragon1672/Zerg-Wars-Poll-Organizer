import React, { useState, useMemo, useEffect } from 'react';
import type { Poll } from '../types';

interface ExportModalProps {
    polls: Poll[];
    allTags: string[];
    onClose: () => void;
    onExport: (options: { selectedPollIds: string[], format: 'text' | 'ahk', autoTag: string }) => void;
    onDownloadAhkScript: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ polls, allTags, onClose, onExport, onDownloadAhkScript }) => {
    const [selectedPollIds, setSelectedPollIds] = useState<Set<string>>(() => new Set(polls.map(p => p.id)));
    const [tagFilter, setTagFilter] = useState<string[]>([]);
    const [tagFilterMode, setTagFilterMode] = useState<'any' | 'all'>('any');
    const [untaggedFilter, setUntaggedFilter] = useState<'any' | 'untagged' | 'tagged'>('any');
    const [format, setFormat] = useState<'text' | 'ahk'>('text');
    const [autoTag, setAutoTag] = useState('');
    
    const filteredPolls = useMemo(() => {
        return polls.filter(poll => {
            const pollTags = new Set(poll.tags || []);
            
            if (untaggedFilter === 'untagged' && pollTags.size > 0) return false;
            if (untaggedFilter === 'tagged' && pollTags.size === 0) return false;
            
            if (tagFilter.length > 0) {
                if (tagFilterMode === 'any') {
                    if (!tagFilter.some(t => pollTags.has(t))) return false;
                } else { // 'all'
                    if (!tagFilter.every(t => pollTags.has(t))) return false;
                }
            }
            
            return true;
        });
    }, [polls, tagFilter, tagFilterMode, untaggedFilter]);
    
    const togglePollSelection = (pollId: string) => {
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
    
    const handleSelectOnlyShown = () => {
        setSelectedPollIds(new Set(filteredPolls.map(p => p.id)));
    };
    
    const handleAddAllShown = () => {
        setSelectedPollIds(prev => {
            const newSet = new Set(prev);
            filteredPolls.forEach(p => newSet.add(p.id));
            return newSet;
        });
    };

    const handleDeselectAll = () => {
        setSelectedPollIds(new Set());
    };
    
    const handleTagFilterChange = (tag: string) => {
        setTagFilter(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };
    
    const handleExportClick = () => {
        if (selectedPollIds.size === 0) {
            alert('Please select at least one poll to export.');
            return;
        }
        onExport({
            selectedPollIds: Array.from(selectedPollIds),
            format,
            autoTag
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-60 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                <header className="p-4 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Export Polls</h2>
                </header>

                <main className="flex-grow flex flex-col md:flex-row gap-4 p-4 min-h-0">
                    {/* Left Column: Filtering and Selection */}
                    <div className="md:w-3/5 flex flex-col gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700">
                             <h3 className="font-semibold mb-2 dark:text-gray-200">Filter by Tags</h3>
                             <div className="max-h-24 overflow-y-auto flex flex-wrap gap-2 mb-2 p-1">
                                {allTags.map(tag => (
                                    <button 
                                        key={tag} 
                                        onClick={() => handleTagFilterChange(tag)}
                                        className={`px-2 py-1 text-xs font-medium rounded-full border transition-colors ${tagFilter.includes(tag) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                                    >{tag}</button>
                                ))}
                             </div>
                             {tagFilter.length > 0 && (
                                <div className="flex items-center gap-4 text-sm">
                                    <label><input type="radio" name="tagMode" value="any" checked={tagFilterMode === 'any'} onChange={() => setTagFilterMode('any')} className="mr-1"/> Match Any Tag</label>
                                    <label><input type="radio" name="tagMode" value="all" checked={tagFilterMode === 'all'} onChange={() => setTagFilterMode('all')} className="mr-1"/> Match All Tags</label>
                                </div>
                              )}
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700 text-sm flex items-center gap-4">
                            <h3 className="font-semibold dark:text-gray-200">Tag Status:</h3>
                            <label><input type="radio" name="untagged" value="any" checked={untaggedFilter === 'any'} onChange={() => setUntaggedFilter('any')} className="mr-1"/> All</label>
                            <label><input type="radio" name="untagged" value="tagged" checked={untaggedFilter === 'tagged'} onChange={() => setUntaggedFilter('tagged')} className="mr-1"/> Only Tagged</label>
                            <label><input type="radio" name="untagged" value="untagged" checked={untaggedFilter === 'untagged'} onChange={() => setUntaggedFilter('untagged')} className="mr-1"/> Only Untagged</label>
                        </div>
                        <div className="flex-grow flex flex-col min-h-0 border dark:border-gray-700 rounded-lg">
                            <div className="p-2 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 rounded-t-lg">
                                <p className="font-semibold text-sm">{filteredPolls.length} polls shown ({selectedPollIds.size} selected)</p>
                                <div className="space-x-2">
                                    <button onClick={handleSelectOnlyShown} className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Select Only Shown</button>
                                    <button onClick={handleAddAllShown} className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Add All Shown</button>
                                    <button onClick={handleDeselectAll} className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Deselect All</button>
                                </div>
                            </div>
                            <div className="flex-grow overflow-y-auto p-2">
                                {filteredPolls.map(poll => (
                                    <label key={poll.id} className="flex items-start p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer">
                                        <input type="checkbox" checked={selectedPollIds.has(poll.id)} onChange={() => togglePollSelection(poll.id)} className="mt-1 mr-3"/>
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
                    
                    {/* Right Column: Export Options */}
                    <div className="md:w-2/5 flex flex-col gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700 space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2 dark:text-gray-200">1. Export Format</h3>
                                <div className="flex flex-col gap-2">
                                    <label className="p-3 border dark:border-gray-600 rounded-md has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/30 has-[:checked]:border-indigo-500">
                                        <input type="radio" name="format" value="text" checked={format === 'text'} onChange={() => setFormat('text')} className="mr-2"/>
                                        <span className="font-bold">Text (.txt)</span> - Plain text format, easy to read.
                                    </label>
                                     <label className="p-3 border dark:border-gray-600 rounded-md has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/30 has-[:checked]:border-indigo-500">
                                        <input type="radio" name="format" value="ahk" checked={format === 'ahk'} onChange={() => setFormat('ahk')} className="mr-2"/>
                                        <span className="font-bold">AutoHotKey (.txt)</span> - For use with the Discord helper script.
                                    </label>
                                </div>
                            </div>
                             {format === 'ahk' && (
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg border border-blue-300 dark:border-blue-700 text-sm">
                                    <p className="mb-2">This format requires the AutoHotKey helper script to automate posting in Discord.</p>
                                    <button onClick={onDownloadAhkScript} className="w-full text-center px-3 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                        Download AHK Script
                                    </button>
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold mb-2 dark:text-gray-200">2. Auto-Tag on Export (Optional)</h3>
                                <input 
                                    type="text" 
                                    value={autoTag}
                                    onChange={(e) => setAutoTag(e.target.value)}
                                    placeholder="e.g., exported-july-24"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">If filled, this tag will be added to all exported polls.</p>
                            </div>
                        </div>
                         <div className="p-4 bg-green-50 dark:bg-green-900/50 rounded-lg border border-green-300 dark:border-green-700">
                            <h3 className="font-bold text-green-800 dark:text-green-200">Ready to Export?</h3>
                            <p className="text-sm mt-1 text-green-700 dark:text-green-300">
                                You have selected <span className="font-bold">{selectedPollIds.size}</span> poll(s).
                            </p>
                        </div>
                    </div>
                </main>

                <footer className="p-4 border-t dark:border-gray-700 flex justify-end items-center gap-3 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"> Cancel </button>
                    <button onClick={handleExportClick} className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-md transition flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Export {selectedPollIds.size} Polls
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ExportModal;