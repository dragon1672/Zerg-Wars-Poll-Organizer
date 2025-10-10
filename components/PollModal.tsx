
import React, { useState, useEffect, useRef } from 'react';
import type { Poll, PollOption, Category } from '../types';
import type { SortableEvent } from 'sortablejs';

declare const Sortable: any;

interface PollModalProps {
    poll: Poll | null;
    onSave: (pollData: Omit<Poll, 'id' | 'order'>, pollId?: string) => void;
    onClose: () => void;
    categories: Category[];
}

const generateUniqueId = () => crypto.randomUUID().substring(0, 8);

const PollModal: React.FC<PollModalProps> = ({ poll, onSave, onClose, categories }) => {
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('GENERAL');
    const [options, setOptions] = useState<PollOption[]>([]);
    
    const optionsContainerRef = useRef<HTMLDivElement>(null);
    const sortableInstance = useRef<any>(null);

    useEffect(() => {
        if (poll) {
            setDescription(poll.description || '');
            setCategory(poll.category || 'GENERAL');
            setOptions(JSON.parse(JSON.stringify(poll.options || [])));
        } else {
            setDescription('');
            setCategory('GENERAL');
            setOptions([]);
        }
    }, [poll]);
    
    useEffect(() => {
        if (optionsContainerRef.current) {
            sortableInstance.current = new Sortable(optionsContainerRef.current, {
                handle: '.drag-handle',
                animation: 150,
                onEnd: (evt: SortableEvent) => {
                    const { oldIndex, newIndex } = evt;
                    if (oldIndex === undefined || newIndex === undefined) return;
                    setOptions(prevOptions => {
                        const newOptions = [...prevOptions];
                        const [movedItem] = newOptions.splice(oldIndex, 1);
                        newOptions.splice(newIndex, 0, movedItem);
                        return newOptions;
                    });
                }
            });
        }
        return () => {
            if (sortableInstance.current) {
                sortableInstance.current.destroy();
            }
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validOptions = options.filter(opt => opt.text.trim().length > 0);
        if (!description.trim() || validOptions.length < 2) {
            alert("Error: Description and at least two non-empty options are required.");
            return;
        }
        onSave({ description, category, options: validOptions }, poll?.id);
    };

    const handleAddOption = () => setOptions([...options, { id: generateUniqueId(), text: '' }]);
    const handleRemoveOption = (id: string) => setOptions(options.filter(opt => opt.id !== id));
    const handleUpdateOptionText = (id: string, text: string) => {
        setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
    };
    
    const applyTemplate = (templateOptions: {text: string}[]) => {
        setOptions(templateOptions.map(opt => ({ id: generateUniqueId(), text: opt.text })));
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-start bg-black bg-opacity-50 overflow-y-auto p-4 pt-12">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-11/12 max-w-2xl my-8 transform transition-all duration-300">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">{poll ? 'Edit Poll' : 'Add New Poll'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">1. Select Category</label>
                        <div className="flex flex-wrap gap-2">
                           {categories.map(cat => (
                                <button key={cat.id} type="button" onClick={() => setCategory(cat.id)} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${category === cat.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                    {cat.title}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="poll-description" className="block text-sm font-bold text-gray-700">2. Description / Question</label>
                        <textarea id="poll-description" value={description} onChange={e => setDescription(e.target.value)} rows={4} required className="mt-1 block w-full rounded-xl border-gray-300 p-2 border shadow-sm" />
                    </div>
                    <div className="mb-6 border-t pt-4">
                        <h3 className="text-lg font-bold text-gray-800">3. Voting Options</h3>
                        <div className="my-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                             <p className="text-sm font-semibold text-gray-700 mb-2">Templates</p>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => applyTemplate([{ text: 'A good change, keep it and balance around it' }, { text: 'Neutral, I do not have a strong opinion' }, { text: 'A bad change, revert this' }])} className="px-3 py-1 text-xs font-medium text-orange-600 border border-orange-600 rounded-full hover:bg-orange-50 transition"> Design (3) </button>
                                <button type="button" onClick={() => applyTemplate([{ text: 'Overpowered' }, { text: 'Stronger than balanced' }, { text: 'Balanced' }, { text: 'Weaker than balanced' }, { text: 'Underpowered' }])} className="px-3 py-1 text-xs font-medium text-purple-600 border border-purple-600 rounded-full hover:bg-purple-50 transition"> Balance (5) </button>
                            </div>
                        </div>
                        <button type="button" onClick={handleAddOption} className="px-3 py-1 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-full hover:bg-indigo-50 transition mb-3"> + Add Custom Option </button>
                        <div ref={optionsContainerRef} className="space-y-3">
                            {options.map((option, index) => (
                                <div key={option.id} className="flex items-start mb-3 p-2 bg-gray-50 rounded-lg border">
                                    <div className="drag-handle cursor-move pt-2 pr-3 text-gray-400 hover:text-gray-600" title="Drag to reorder">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                                    </div>
                                    <div className="flex-grow">
                                        <label className="text-sm font-semibold text-gray-700 block mb-1">{index + 1}. Option</label>
                                        <textarea rows={2} value={option.text} onChange={e => handleUpdateOptionText(option.id, e.target.value)} className="block w-full rounded-lg border-gray-300 p-2 border text-sm" />
                                    </div>
                                    <button type="button" onClick={() => handleRemoveOption(option.id)} className="ml-3 mt-8 p-1 text-red-500 hover:text-red-700" title="Remove"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                </div>
                            ))}
                        </div>
                         <p className="text-xs text-gray-500 mt-2">Use the drag handle to reorder options. Polls require at least 2 non-empty options.</p>
                    </div>
                    <div className="flex justify-end space-x-3 border-t pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition"> Cancel </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md transition"> Save Poll </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PollModal;
