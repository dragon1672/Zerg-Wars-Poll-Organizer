import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Poll, PollOption, Category, Template } from '../types';

interface PollModalProps {
    poll: Poll | null;
    onSave: (pollData: Omit<Poll, 'id' | 'order'>, pollId?: string) => void;
    onClose: () => void;
    categories: Category[];
    templates: Template[];
    defaultCategory?: string | null;
    allTags: string[];
}

const generateUniqueId = () => crypto.randomUUID().substring(0, 8);

type FormatType = 'bold' | 'italic' | 'strike' | 'code' | 'quote';

const MarkdownToolbar: React.FC<{ onFormat: (type: FormatType) => void }> = ({ onFormat }) => {
    const buttonClass = "p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors";
    // FIX: Replaced JSX.Element with React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
    const buttons: { type: FormatType, label: string, icon: React.ReactNode }[] = [
        { type: 'bold', label: 'Bold', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 12H4M13 12a4 4 0 100-8H4a4 4 0 100 8zm0 0a4 4 0 110 8H4a4 4 0 110-8z"></path></svg> },
        { type: 'italic', label: 'Italic', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4h2m-2 16h2M6 20L18 4"></path></svg> },
        { type: 'strike', label: 'Strikethrough', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M17 6H7a4 4 0 00-4 4v0a4 4 0 004 4h10"></path></svg> },
        { type: 'code', label: 'Code', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg> },
        { type: 'quote', label: 'Blockquote', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 17h12M6 12h12M6 7h12"></path></svg> },
    ];

    return (
        <div className="flex items-center space-x-1 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 rounded-t-lg p-1">
            {buttons.map(btn => (
                <button key={btn.type} type="button" onClick={() => onFormat(btn.type)} title={btn.label} className={buttonClass}>
                    {btn.icon}
                </button>
            ))}
        </div>
    );
};

const PollModal: React.FC<PollModalProps> = ({ poll, onSave, onClose, categories, templates, defaultCategory, allTags }) => {
    const [description, setDescription] = useState('');
    const [threadTitle, setThreadTitle] = useState('');
    const [category, setCategory] = useState('GENERAL');
    const [options, setOptions] = useState<PollOption[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [initialStateJSON, setInitialStateJSON] = useState<string>('');
    
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const saveButtonRef = useRef<HTMLButtonElement>(null);
    const modalContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const pollData = poll 
            ? { description: poll.description || '', category: poll.category || 'GENERAL', options: poll.options || [], tags: poll.tags || [], threadTitle: poll.threadTitle || '' }
            : { description: '', category: defaultCategory || 'GENERAL', options: [], tags: [], threadTitle: '' };
        
        setDescription(pollData.description);
        setCategory(pollData.category);
        setOptions(JSON.parse(JSON.stringify(pollData.options)));
        setTags([...pollData.tags]);
        setThreadTitle(pollData.threadTitle);

        setInitialStateJSON(JSON.stringify({
            description: pollData.description,
            category: pollData.category,
            options: pollData.options,
            tags: pollData.tags,
            threadTitle: pollData.threadTitle,
        }));
    }, [poll, defaultCategory]);

    useEffect(() => {
        if (!poll && description) {
            const newTitle = description.split('\n')[0].substring(0, 100);
            setThreadTitle(newTitle);
        }
    }, [description, poll]);
    
    const isDirty = useCallback(() => {
        const currentState = { description, category, options, tags, threadTitle };
        return JSON.stringify(currentState) !== initialStateJSON;
    }, [description, category, options, tags, threadTitle, initialStateJSON]);

    const handleAttemptClose = useCallback(() => {
        if (isDirty()) {
            const saveButton = saveButtonRef.current;
            if (saveButton) {
                saveButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                saveButton.classList.add('animate-pulse', 'ring-2', 'ring-offset-2', 'ring-red-500', 'dark:ring-red-400');
                setTimeout(() => {
                    saveButton.classList.remove('animate-pulse', 'ring-2', 'ring-offset-2', 'ring-red-500', 'dark:ring-red-400');
                }, 2500);
            }
        } else {
            onClose();
        }
    }, [isDirty, onClose]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleAttemptClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleAttemptClose]);
    
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
            handleAttemptClose();
        }
    };
    
    const handleFormat = (type: FormatType) => {
        const textarea = descriptionRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = description.substring(start, end);

        let newDescription = '';
        let cursorOffset = 0;

        const formatMap = { bold: '**', italic: '*', strike: '~~', code: '`' };
        
        if (type === 'bold' || type === 'italic' || type === 'strike' || type === 'code') {
            const marker = formatMap[type];
            newDescription = `${description.substring(0, start)}${marker}${selectedText}${marker}${description.substring(end)}`;
            cursorOffset = start + marker.length;
        } else if (type === 'quote') {
            const lines = description.substring(0, start).split('\n');
            const currentLineStart = start - lines[lines.length - 1].length;
            newDescription = `${description.substring(0, currentLineStart)}> ${description.substring(currentLineStart)}`;
            cursorOffset = start + 2;
        }

        setDescription(newDescription);
        
        textarea.focus();
        setTimeout(() => textarea.setSelectionRange(cursorOffset, cursorOffset + selectedText.length), 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validOptions = options.filter(opt => opt.text.trim().length > 0);
        if (!description.trim() || validOptions.length < 2) {
            alert("Error: Description and at least two non-empty options are required.");
            return;
        }
        onSave({ description, category, options: validOptions, tags, threadTitle }, poll?.id);
    };

    const handleAddOption = () => setOptions([...options, { id: generateUniqueId(), text: '' }]);
    const handleRemoveOption = (id: string) => setOptions(options.filter(opt => opt.id !== id));
    const handleUpdateOptionText = (id: string, text: string) => {
        setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
    };
    
    const moveOption = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === options.length - 1) return;

        setOptions(prevOptions => {
            const newOptions = [...prevOptions];
            const [movedItem] = newOptions.splice(index, 1);
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            newOptions.splice(newIndex, 0, movedItem);
            return newOptions;
        });
    };
    
    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim().toLowerCase();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput('');
        }
    };
    
    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const applyTemplate = (templateOptions: {text: string}[]) => {
        setOptions(templateOptions.map(opt => ({ id: generateUniqueId(), text: opt.text })));
    };
    
    const templateColors = ['orange', 'purple', 'teal', 'cyan', 'pink', 'lime'];

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-start bg-black bg-opacity-50 overflow-y-auto p-4 pt-12" onMouseDown={handleBackdropClick}>
            <div ref={modalContentRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-11/12 max-w-2xl my-8 transform transition-all duration-300">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 border-b dark:border-gray-700 pb-2">{poll ? 'Edit Poll' : 'Add New Poll'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">1. Select Category</label>
                        <div className="flex flex-wrap gap-2">
                           {categories.map(cat => (
                                <button key={cat.id} type="button" onClick={() => setCategory(cat.id)} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${category === cat.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}>
                                    {cat.title}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="poll-description" className="block text-sm font-bold text-gray-700 dark:text-gray-300">2. Description / Question</label>
                         <div className="mt-1">
                            <MarkdownToolbar onFormat={handleFormat} />
                            <textarea id="poll-description" ref={descriptionRef} value={description} onChange={e => setDescription(e.target.value)} rows={4} required className="block w-full rounded-b-xl border-gray-300 p-2 border border-t-0 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="poll-thread-title" className="block text-sm font-bold text-gray-700 dark:text-gray-300">3. Thread Title (Optional)</label>
                        <input
                            id="poll-thread-title"
                            type="text"
                            value={threadTitle}
                            onChange={e => setThreadTitle(e.target.value)}
                            placeholder="A short title for the Discord thread..."
                            className="block w-full rounded-lg border-gray-300 p-2 border shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 mt-1"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">If left empty, a title will be generated from the description during export.</p>
                    </div>
                     <div className="mb-6 border-t dark:border-gray-700 pt-4">
                        <label htmlFor="poll-tags" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">4. Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map(tag => (
                                <div key={tag} className="flex items-center bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 text-sm font-medium px-2.5 py-1 rounded-full">
                                    <span>{tag}</span>
                                    <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <input
                            id="poll-tags"
                            type="text"
                            list="all-tags-list"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagInputKeyDown}
                            placeholder="Add a tag and press Enter..."
                            className="block w-full rounded-lg border-gray-300 p-2 border shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                        <datalist id="all-tags-list">
                            {allTags.map(tag => <option key={tag} value={tag} />)}
                        </datalist>
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate tags with a comma or by pressing Enter.</p>
                    </div>
                    <div className="mb-6 border-t dark:border-gray-700 pt-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">5. Voting Options</h3>
                        <div className="my-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                             <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Apply a Template</p>
                            <div className="flex flex-wrap gap-2">
                                {templates.map((template, index) => {
                                    const color = templateColors[index % templateColors.length];
                                    return (
                                        <button key={template.id} type="button" onClick={() => applyTemplate(template.options)} className={`px-3 py-1 text-xs font-medium text-${color}-600 border border-${color}-600 rounded-full hover:bg-${color}-50 transition dark:text-${color}-400 dark:border-${color}-400 dark:hover:bg-${color}-900/40`}>
                                            {template.name}
                                        </button>
                                    );
                                })}
                                 {templates.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400">No templates found. You can create some in "Manage Templates".</p>}
                            </div>
                        </div>
                        <button type="button" onClick={handleAddOption} className="px-3 py-1 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-full hover:bg-indigo-50 transition dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-indigo-900/40 mb-3"> + Add Custom Option </button>
                        <div className="space-y-3">
                            {options.map((option, index) => (
                                <div key={option.id} className="flex items-start mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                                     <div className="flex flex-col pt-7 mr-2">
                                        <button type="button" onClick={() => moveOption(index, 'up')} disabled={index === 0} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                                        </button>
                                        <button type="button" onClick={() => moveOption(index, 'down')} disabled={index === options.length - 1} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </button>
                                    </div>
                                    <div className="flex-grow">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">{index + 1}. Option</label>
                                        <textarea rows={2} value={option.text} onChange={e => handleUpdateOptionText(option.id, e.target.value)} className="block w-full rounded-lg border-gray-300 p-2 border text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
                                    </div>
                                    <button type="button" onClick={() => handleRemoveOption(option.id)} className="ml-3 mt-8 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" title="Remove"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                </div>
                            ))}
                        </div>
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Use the arrow buttons to reorder options. Polls require at least 2 non-empty options.</p>
                    </div>
                    <div className="flex justify-end space-x-3 border-t dark:border-gray-700 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"> Cancel </button>
                        <button ref={saveButtonRef} type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md transition"> Save Poll </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PollModal;