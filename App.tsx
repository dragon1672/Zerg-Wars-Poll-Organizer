import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Poll, Polls, Template, ProjectData } from './types';
import { columnCategories, categoryOrderMap, baseTemplatesData } from './constants';
import { ahkScriptContent } from './ahkScript';
import Header from './components/Header';
import UndoBar from './components/UndoBar';
import Column from './components/Column';
import PollModal from './components/PollModal';
import TemplateModal from './components/TemplateModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import ContextMenu from './components/ContextMenu';
import FloatingPollCard from './components/FloatingPollCard';

import { usePolls } from './hooks/usePolls';
import { useTemplates } from './hooks/useTemplates';
import { useColumnCollapse } from './hooks/useColumnCollapse';
import { useDragAndDrop } from './hooks/useDragAndDrop';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
    // Custom Hooks for state management
    const { 
        polls, setPolls, lastDeletedPoll, hideUndoBar, savePoll, deletePoll, undoDelete, 
        duplicatePoll, movePoll, handlePollDrop, deleteAllPolls, resetPolls
    } = usePolls();
    
    const { templates, saveTemplates, resetTemplates } = useTemplates();
    const { collapsedState, toggleCollapse: handleToggleCollapse } = useColumnCollapse();

    // UI State
    const [theme, setTheme] = useState<Theme>('light');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal States
    const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [newPollCategory, setNewPollCategory] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{
        title: string; message: string; confirmText: string; onConfirm: () => void;
    } | null>(null);

    // Modal Handlers
    const handleOpenAddModal = useCallback((categoryId?: string) => {
        hideUndoBar();
        setEditingPoll(null);
        setNewPollCategory(categoryId || null);
        setIsAddModalOpen(true);
    }, [hideUndoBar]);
    
    const handleOpenEditModal = useCallback((pollId: string) => {
        const pollToEdit = polls[pollId];
        if (!pollToEdit) {
            console.error(`Attempted to edit non-existent poll with ID: ${pollId}`);
            return;
        }
        hideUndoBar();
        setEditingPoll(pollToEdit);
        setNewPollCategory(null);
        setIsAddModalOpen(true);
    }, [polls, hideUndoBar]);

    const handleClosePollModal = () => {
        setIsAddModalOpen(false);
        setEditingPoll(null);
        setNewPollCategory(null);
    };

    const handleSavePoll = (pollData: Omit<Poll, 'id' | 'order'>, pollId?: string) => {
        savePoll(pollData, pollId, newPollCategory);
        handleClosePollModal();
    };

    const handleSaveTemplates = (updatedTemplates: Template[]) => {
        saveTemplates(updatedTemplates);
        setIsTemplateModalOpen(false);
    };

    // Drag and Drop Hook
    const { 
        stickiedPoll, dropPlaceholder, contextMenu, closeContextMenu,
        handlePollMouseDown, handlePollContextMenu, 
        handleStartStickyMoveFromContextMenu 
    } = useDragAndDrop({ polls, onDrop: handlePollDrop, onClick: handleOpenEditModal });


    // Theme Effect
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        if (storedTheme) {
            setTheme(storedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
    }, []);

    // Confirmation Modal Logic
    const handleDeleteAll = () => {
        deleteAllPolls();
        saveTemplates([]);
        setConfirmAction(null);
    };

    const handleResetToDefaults = () => {
        resetPolls();
        resetTemplates();
        setConfirmAction(null);
    };

    const handleDeletePollsOnly = () => {
        deleteAllPolls();
        setConfirmAction(null);
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
    
    // Project and Export Logic
    const handleExport = (format: 'text' | 'ahk') => {
        let exportText = "";
        const fileExtension = 'txt';
    
        const sortedPolls = (Object.values(polls) as Poll[])
            .sort((a, b) => {
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
                const parts = [poll.description]; // Keep description as is for markdown
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
                        saveTemplates(data.templates as Template[]);
                        alert('Project loaded successfully!');
                    } else {
                        resetTemplates();
                        alert('Project with polls data loaded successfully! Default templates have been added.');
                    }
                } else if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
                    const firstKey = Object.keys(data)[0];
                    if (firstKey && data[firstKey] && typeof data[firstKey] === 'object' && 'description' in data[firstKey] && 'category' in data[firstKey]) {
                        setPolls(data as Polls);
                        resetTemplates();
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

    const activePolls = Object.values(polls) as Poll[];
    const collapsedCategories = columnCategories.filter(col => collapsedState.get(col.id));
    const expandedCategories = columnCategories.filter(col => !collapsedState.get(col.id));

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Header
                theme={theme}
                setTheme={setTheme}
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
            
            <UndoBar lastDeletedPoll={lastDeletedPoll} onUndo={undoDelete} />

            <main className="flex-grow flex flex-col overflow-hidden p-4 gap-4">
                <div id="collapsed-columns-container" className="flex-shrink-0 flex flex-wrap gap-3 p-2 rounded-xl bg-gray-100/70 dark:bg-gray-900/70 shadow-inner max-h-[140px] overflow-y-auto">
                    {collapsedCategories.length === 0 && (
                         <p className="text-sm text-gray-500 dark:text-gray-400 p-2">All categories are expanded. Click a column header to collapse it.</p>
                    )}
                    {collapsedCategories.map(col => (
                        <div
                            key={col.id}
                            className={`flex-shrink-0 w-[150px] h-[50px] p-3 rounded-xl border-l-4 ${col.border} ${col.color} dark:bg-opacity-30 shadow-lg cursor-pointer transition-all duration-200 ease-in-out hover:opacity-90 hover:shadow-xl`}
                            onClick={() => handleToggleCollapse(col.id)}
                        >
                            <div className="flex items-center justify-center h-full">
                                <h2 className="text-sm font-bold truncate text-gray-800 dark:text-gray-200">
                                    {col.title} ({activePolls.filter(p => p.category === col.id).length})
                                </h2>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div id="expanded-columns-container" className="flex-grow flex flex-row gap-4 overflow-y-hidden overflow-x-auto">
                    {expandedCategories.map(category => (
                        <Column
                            key={category.id}
                            category={category}
                            polls={activePolls.filter(p => p.category === category.id).sort((a, b) => (a.order || 0) - (b.order || 0))}
                            onToggleCollapse={handleToggleCollapse}
                            onPollMouseDown={handlePollMouseDown}
                            onAddPollToCategory={handleOpenAddModal}
                            onPollContextMenu={handlePollContextMenu}
                            stickiedPollId={stickiedPoll?.poll.id ?? null}
                            dropPlaceholder={dropPlaceholder}
                        />
                    ))}
                </div>
            </main>
            
            {stickiedPoll && <FloatingPollCard poll={stickiedPoll.poll} x={stickiedPoll.x} y={stickiedPoll.y} />}

            {contextMenu && (
                 <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={closeContextMenu}
                    onDuplicate={() => duplicatePoll(contextMenu.poll.id)}
                    onDelete={() => deletePoll(contextMenu.poll.id)}
                    onStickyMove={handleStartStickyMoveFromContextMenu}
                    onMoveUp={() => movePoll(contextMenu.poll.id, 'up')}
                    onMoveDown={() => movePoll(contextMenu.poll.id, 'down')}
                    onMoveToTop={() => movePoll(contextMenu.poll.id, 'top')}
                    onMoveToBottom={() => movePoll(contextMenu.poll.id, 'bottom')}
                 />
            )}
            
            {(isAddModalOpen) && (
                <PollModal
                    poll={editingPoll}
                    onSave={handleSavePoll}
                    onClose={handleClosePollModal}
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
        </div>
    );
};

export default App;
