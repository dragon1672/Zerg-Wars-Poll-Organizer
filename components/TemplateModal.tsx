import React, { useState, useEffect, useRef } from 'react';
import type { Template } from '../types';

interface TemplateModalProps {
    templates: Template[];
    onSave: (templates: Template[]) => void;
    onClose: () => void;
}

const generateUniqueId = () => `template_${crypto.randomUUID().substring(0, 8)}`;

const TemplateEditor: React.FC<{
    template: Template;
    onSave: (template: Template) => void;
    onCancel: () => void;
}> = ({ template, onSave, onCancel }) => {
    const [name, setName] = useState(template.name);
    const [options, setOptions] = useState(template.options);

    const handleAddOption = () => setOptions([...options, { text: '' }]);
    const handleRemoveOption = (index: number) => setOptions(options.filter((_, i) => i !== index));
    const handleUpdateOption = (index: number, text: string) => setOptions(options.map((opt, i) => (i === index ? { ...opt, text } : opt)));

    const handleMoveOption = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === options.length - 1) return;
        
        const newOptions = [...options];
        const [movedItem] = newOptions.splice(index, 1);
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        newOptions.splice(newIndex, 0, movedItem);
        setOptions(newOptions);
    };

    const handleSaveClick = () => {
        const finalOptions = options.filter(opt => opt.text.trim());
        if (!name.trim() || finalOptions.length < 1) {
            alert('Template name and at least one non-empty option are required.');
            return;
        }
        onSave({ ...template, name, options: finalOptions });
    };

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600 mt-2">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">{template.id ? 'Edit Template' : 'Create New Template'}</h3>
            <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Template Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="block w-full rounded-lg border-gray-300 p-2 border shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Options</label>
                <div className="space-y-2">
                    {options.map((opt, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="flex flex-col">
                                <button type="button" onClick={() => handleMoveOption(index, 'up')} disabled={index === 0} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                                </button>
                                <button type="button" onClick={() => handleMoveOption(index, 'down')} disabled={index === options.length - 1} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                            </div>
                            <input type="text" value={opt.text} onChange={e => handleUpdateOption(index, e.target.value)} className="flex-grow rounded-md border-gray-300 p-1 border text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" />
                            <button onClick={() => handleRemoveOption(index)} className="ml-2 text-red-500 dark:text-red-400 p-1 hover:bg-red-100 dark:hover:bg-gray-600 rounded-full" title="Remove Option">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={handleAddOption} className="mt-3 px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-600 rounded-full hover:bg-indigo-50 transition dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-indigo-900/40">+ Add Option</button>
            </div>
            <div className="flex justify-end space-x-2 mt-4 border-t dark:border-gray-600 pt-3">
                <button onClick={onCancel} className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                <button onClick={handleSaveClick} className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Template</button>
            </div>
        </div>
    );
};

const TemplateModal: React.FC<TemplateModalProps> = ({ templates, onSave, onClose }) => {
    const [localTemplates, setLocalTemplates] = useState<Template[]>(() => JSON.parse(JSON.stringify(templates)));
    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

    const handleAddNew = () => {
        const newTemplate = { id: generateUniqueId(), name: '', options: [{ text: '' }, { text: '' }] };
        setLocalTemplates([newTemplate, ...localTemplates]);
        setEditingTemplateId(newTemplate.id);
    };

    const handleSaveTemplate = (updatedTemplate: Template) => {
        setLocalTemplates(localTemplates.map(t => (t.id === updatedTemplate.id ? updatedTemplate : t)));
        setEditingTemplateId(null);
    };

    const handleDeleteTemplate = (id: string) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            setLocalTemplates(localTemplates.filter(t => t.id !== id));
            if (editingTemplateId === id) setEditingTemplateId(null);
        }
    };
    
    const handleFinalSave = () => {
        onSave(localTemplates);
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-start bg-black bg-opacity-50 overflow-y-auto p-4 pt-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-11/12 max-w-2xl my-8">
                <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Manage Templates</h2>
                    <button onClick={handleAddNew} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition">+ Create New</button>
                </div>
                
                <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1">
                    {localTemplates.map(template => (
                        <div key={template.id}>
                            {editingTemplateId === template.id ? (
                                <TemplateEditor
                                    template={template}
                                    onSave={handleSaveTemplate}
                                    onCancel={() => setEditingTemplateId(null)}
                                />
                            ) : (
                                <div className="p-3 bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold dark:text-gray-200">{template.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{template.options.length} options</p>
                                    </div>
                                    <div className="space-x-2">
                                        <button onClick={() => setEditingTemplateId(template.id)} className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Edit</button>
                                        <button onClick={() => handleDeleteTemplate(template.id)} className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600">Delete</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end space-x-3 border-t dark:border-gray-700 pt-4 mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Close</button>
                    <button type="button" onClick={handleFinalSave} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 shadow-md transition">Save & Close</button>
                </div>
            </div>
        </div>
    );
};

export default TemplateModal;