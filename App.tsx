
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Poll, Polls, Template, ProjectData } from './types';
import { STORAGE_KEY, TEMPLATE_STORAGE_KEY, COLLAPSE_KEY, columnCategories, basePollsData, baseTemplatesData, categoryOrderMap } from './constants';
import { ahkScriptContent } from './ahkScript';
import Header from './components/Header';
import UndoBar from './components/UndoBar';
import Column from './components/Column';
import PollModal from './components/PollModal';
import TemplateModal from './components/TemplateModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';

// Helper to generate a unique ID
const generateUniqueId = () => crypto.randomUUID().substring(0, 8);

const App: React.FC = () => {
    const [polls, setPolls] = useState<Polls>({});
    const [templates, setTemplates] = useState<Template[]>([]);
    const [collapsedState, setCollapsedState] = useState<Map<string, boolean>>(new Map());
    const [lastDeletedPoll, setLastDeletedPoll] = useState<{ id: string; data: Poll } | null>(null);
    const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [newPollCategory, setNewPollCategory] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [confirmAction, setConfirmAction] = useState<{
        title: string;
        message: string;
        confirmText: string;
        onConfirm: () => void;
    } | null>(null);

    // Load data from localStorage on initial render
    useEffect(() => {
        try {
            const storedPolls = localStorage.getItem(STORAGE_KEY);
            setPolls(storedPolls ? JSON.parse(storedPolls) : basePollsData);
            
            const storedTemplates = localStorage.getItem(TEMPLATE_STORAGE_KEY);
            setTemplates(storedTemplates ? JSON.parse(storedTemplates) : baseTemplatesData);

            const storedCollapseState = localStorage.getItem(COLLAPSE_KEY);
            if (storedCollapseState) {
                setCollapsedState(new Map(JSON.parse(storedCollapseState)));
            } else {
                const defaultCollapseState = new Map();
                columnCategories.forEach(cat => defaultCollapseState.set(cat.id, true));
                setCollapsedState(defaultCollapseState);
            }
        } catch (e) {
            console.error("Error loading data from Local Storage. Starting fresh.", e);
            setPolls(basePollsData);
            setTemplates(baseTemplatesData);
        }
    }, []);

    // Save polls to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
        } catch (e) {
            console.error("Error saving poll data to Local Storage:", e);
        }
    }, [polls]);
    
    // Save templates to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
        } catch(e) {
             console.error("Error saving templates to Local Storage:", e);
        }
    }, [templates]);

    // Save collapse state to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(COLLAPSE_KEY, JSON.stringify(Array.from(collapsedState.entries())));
        } catch (e) {
            console.error("Error saving collapse state to Local Storage:", e);
        }
    }, [collapsedState]);
    
    const hideUndoBar = useCallback(() => {
        setLastDeletedPoll(null);
    }, []);

    const handleOpenAddModal = (categoryId?: string) => {
        hideUndoBar();
        setEditingPoll(null);
        setNewPollCategory(categoryId || null);
        setIsAddModalOpen(true);
    };
    
    const handleOpenEditModal = (pollId: string) => {
        hideUndoBar();
        setEditingPoll(polls[pollId]);
        setNewPollCategory(null);
        setIsAddModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingPoll(null);
        setNewPollCategory(null);
    };

    const handleSavePoll = (pollData: Omit<Poll, 'id' | 'order'>, pollId?: string) => {
        setPolls(prevPolls => {
            const newPolls = { ...prevPolls };
            if (pollId) { // Update existing poll
                newPolls[pollId] = { ...newPolls[pollId], ...pollData };
            } else { // Create new poll
                const newId = `poll_${generateUniqueId()}`;
                const category = newPollCategory || pollData.category;
                const currentPolls = Object.values(newPolls).filter((p: Poll) => p.category === category);
                const maxOrder = currentPolls.length > 0 ? Math.max(...currentPolls.map(p => p.order || 0)) : 0;
                newPolls[newId] = { ...pollData, category, id: newId, order: maxOrder + 10 };
            }
            return newPolls;
        });
        handleCloseModal();
    };

    const handleDeletePoll = (pollId: string) => {
        if (!polls[pollId]) return;
        setLastDeletedPoll({ id: pollId, data: { ...polls[pollId] } });
        setPolls(prevPolls => {
            const newPolls = { ...prevPolls };
            delete newPolls[pollId];
            return newPolls;
        });
    };
    
    const handleUndoDelete = () => {
        if (!lastDeletedPoll) return;
        setPolls(prevPolls => ({
            ...prevPolls,
            [lastDeletedPoll.id]: lastDeletedPoll.data
        }));
        hideUndoBar();
    };

    const handleDuplicatePoll = (pollId: string) => {
        hideUndoBar();
        const originalPoll = polls[pollId];
        if (!originalPoll) return;

        const newId = `poll_${generateUniqueId()}`;
        const newPollData = {
            ...originalPoll,
            id: newId,
            order: (originalPoll.order || 0) + 1,
        };
        
        setPolls(prevPolls => {
             const newPolls = { ...prevPolls };
             newPolls[newId] = newPollData;
             return newPolls;
        });
    };

    const handleDeleteAll = () => {
        setPolls({});
        setTemplates([]);
        setConfirmAction(null);
        hideUndoBar();
    };

    const handleResetToDefaults = () => {
        setPolls(basePollsData);
        setTemplates(baseTemplatesData);
        setConfirmAction(null);
        hideUndoBar();
    };

    const handleDeletePollsOnly = () => {
        setPolls({});
        setConfirmAction(null);
        hideUndoBar();
    };

    const requestDeleteAll = () => {
        hideUndoBar();
        setConfirmAction({
            title: 'Delete All Data',
            message: 'Are you sure you want to delete everything? This will permanently clear all polls and custom templates from your local browser storage.',
            confirmText: 'Yes, Delete All',
            onConfirm: handleDeleteAll,
        });
    };
    
    const requestResetToDefaults = () => {
        hideUndoBar();
        setConfirmAction({
            title: 'Reset to Default Data',
            message: 'Are you sure you want to reset? This will replace all current polls and templates with the default starting data.',
            confirmText: 'Yes, Reset',
            onConfirm: handleResetToDefaults,
        });
    };
    
    const requestDeletePollsOnly = () => {
        hideUndoBar();
        setConfirmAction({
            title: 'Delete Polls Only',
            message: 'Are you sure you want to delete all polls? Your custom templates will be preserved.',
            confirmText: 'Yes, Delete Polls',
            onConfirm: handleDeletePollsOnly,
        });
    };
    
    const handleExport = (format: 'text' | 'ahk') => {
        let exportText = "";
        const fileExtension = 'txt';
    
        const sortedPolls = Object.values(polls).sort((a: Poll, b: Poll) => {
            const catAOrder = categoryOrderMap.get(a.category) ?? 999;
            const catBOrder = categoryOrderMap.get(b.category) ?? 999;
            if (catAOrder !== catBOrder) return catAOrder - catBOrder;
            return (a.order || 0) - (b.order || 0);
        });
    
        if (format === 'text') {
            sortedPolls.forEach((poll) => {
                exportText += `${poll.description}\n`;
                if (poll.options && poll.options.length > 0) {
                    poll.options.forEach((option, index) => {
                        exportText += `${index + 1}. ${option.text.trim()}\n`;
                    });
                }
                exportText += `\n`;
            });
            exportText = exportText.trim() + '\n';
        } else if (format === 'ahk') {
            const lines: string[] = [];
            sortedPolls.forEach((poll) => {
                const sanitize = (text: string) => text.replace(/\|/g, '/').replace(/\n/g, ' ');
                const parts = [sanitize(poll.description)];
                if (poll.options && poll.options.length > 0) {
                    poll.options.forEach((option) => {
                        parts.push(sanitize(option.text.trim()));
                    });
                }
                lines.push(parts.join('|'));
            });
            exportText = lines.join('\n---\n');
        }
    
        const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Zerg_Wars_Polls_${new Date().toISOString().substring(0, 10)}.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadAhkScript = () => {
        const blob = new Blob([ahkScriptContent], { type: 'application/x-autohotkey' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'DiscordPollHelper.ahk';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const handleSaveProject = () => {
        try {
            const projectData: ProjectData = { polls, templates };
            const dataStr = JSON.stringify(projectData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Zerg_Wars_Poll_Project.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error saving project:", error);
            alert("An error occurred while trying to save the project.");
        }
    };

    const handleLoadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File could not be read.");
                const data = JSON.parse(text);

                if (data && typeof data === 'object' && 'polls' in data) {
                    setPolls(data.polls as Polls);
                    if ('templates' in data) {
                        setTemplates(data.templates as Template[]);
                        alert('Project loaded successfully!');
                    } else {
                        setTemplates(baseTemplatesData);
                        alert('Project with polls data loaded successfully! Default templates have been added.');
                    }
                } else if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
                    const firstKey = Object.keys(data)[0];
                    if (firstKey && data[firstKey] && typeof data[firstKey] === 'object' && 'description' in data[firstKey] && 'category' in data[firstKey]) {
                        setPolls(data as Polls);
                        setTemplates(baseTemplatesData);
                        alert('Legacy project loaded successfully! Default templates have been added.');
                    } else {
                        throw new Error("Invalid file format: Unrecognized object structure.");
                    }
                } else {
                    throw new Error("Invalid file format.");
                }
            } catch (error) {
                console.error("Error loading project:", error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                alert(`Failed to load project. The file may be corrupt or in the wrong format. Error: ${errorMessage}`);
            } finally {
                if(event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleToggleCollapse = (categoryId: string) => {
        setCollapsedState(prev => {
            const newState = new Map(prev);
            newState.set(categoryId, !newState.get(categoryId));
            return newState;
        });
    };

    const handlePollDrop = useCallback((pollId: string, newCategoryId: string, orderedIds: string[]) => {
        hideUndoBar();
        setPolls(prevPolls => {
            const newPolls = { ...prevPolls };
            if (newPolls[pollId] && newPolls[pollId].category !== newCategoryId) {
                newPolls[pollId].category = newCategoryId;
            }
            orderedIds.forEach((id, index) => {
                if (newPolls[id]) newPolls[id].order = (index + 1) * 10;
            });
            return newPolls;
        });
    }, [hideUndoBar]);
    
    const handleSaveTemplates = (updatedTemplates: Template[]) => {
        setTemplates(updatedTemplates);
        setIsTemplateModalOpen(false);
    };

    const collapsedCategories = columnCategories.filter(col => collapsedState.get(col.id));
    const expandedCategories = columnCategories.filter(col => !collapsedState.get(col.id));

    return (
        <>
            <Header
                onAddPoll={() => handleOpenAddModal()}
                onExport={handleExport}
                onDownloadAhkScript={handleDownloadAhkScript}
                onSaveProject={handleSaveProject}
                onTriggerLoad={() => fileInputRef.current?.click()}
                onResetToDefaults={requestResetToDefaults}
                onDeletePolls={requestDeletePollsOnly}
                onDeleteAll={requestDeleteAll}
                onManageTemplates={() => setIsTemplateModalOpen(true)}
            />
            
             <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json,application/json"
                onChange={handleLoadProject}
            />
            
            <UndoBar lastDeletedPoll={lastDeletedPoll} onUndo={handleUndoDelete} />

            <main className="p-4 pt-0">
                <div id="collapsed-columns-container" className="flex flex-wrap gap-3 mb-6 p-2 rounded-xl bg-gray-100/70 shadow-inner min-h-[66px]">
                    {collapsedCategories.length === 0 && (
                         <p className="text-sm text-gray-500 p-2">All categories are expanded. Click a column header to collapse it.</p>
                    )}
                    {collapsedCategories.map(col => (
                        <div
                            key={col.id}
                            className={`flex-shrink-0 w-[150px] h-[50px] p-3 rounded-xl border-l-4 ${col.border} ${col.color} shadow-lg cursor-pointer transition-all duration-200 ease-in-out hover:opacity-90 hover:shadow-xl`}
                            onClick={() => handleToggleCollapse(col.id)}
                        >
                            <div className="flex items-center justify-center h-full">
                                <h2 className="text-sm font-bold truncate text-gray-800">
                                    {col.title} ({Object.values(polls).filter((p: Poll) => p.category === col.id).length})
                                </h2>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div id="expanded-columns-container" className="flex flex-col md:flex-row gap-4 items-start pb-4 overflow-x-auto">
                    {expandedCategories.map(category => (
                        <Column
                            key={category.id}
                            category={category}
                            polls={Object.values(polls).filter((p: Poll) => p.category === category.id).sort((a: Poll, b: Poll) => (a.order || 0) - (b.order || 0))}
                            onToggleCollapse={handleToggleCollapse}
                            onEditPoll={handleOpenEditModal}
                            onDeletePoll={handleDeletePoll}
                            onDuplicatePoll={handleDuplicatePoll}
                            onPollDrop={handlePollDrop}
                            onAddPollToCategory={handleOpenAddModal}
                        />
                    ))}
                </div>
            </main>
            
            {(isAddModalOpen) && (
                <PollModal
                    poll={editingPoll}
                    onSave={handleSavePoll}
                    onClose={handleCloseModal}
                    categories={columnCategories}
                    templates={templates}
                    defaultCategory={newPollCategory}
                />
            )}

            {isTemplateModalOpen && (
                <TemplateModal
                    templates={templates}
                    onSave={handleSaveTemplates}
                    onClose={() => setIsTemplateModalOpen(false)}
                />
            )}

            {confirmAction && (
                <ConfirmDeleteModal
                    title={confirmAction.title}
                    message={confirmAction.message}
                    confirmText={confirmAction.confirmText}
                    onConfirm={confirmAction.onConfirm}
                    onClose={() => setConfirmAction(null)}
                />
            )}
        </>
    );
};

export default App;
