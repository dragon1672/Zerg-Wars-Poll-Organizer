import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Poll, Polls, Template, ProjectData, Category } from './types';
// FIX: Corrected typo in imported constant name from 'STORAGE_key' to 'STORAGE_KEY'.
import { STORAGE_KEY, TEMPLATE_STORAGE_KEY, COLLAPSE_KEY, columnCategories, basePollsData, baseTemplatesData, categoryOrderMap } from './constants';
import { ahkScriptContent } from './ahkScript';
import Header from './components/Header';
import UndoBar from './components/UndoBar';
import Column from './components/Column';
import PollModal from './components/PollModal';
import TemplateModal from './components/TemplateModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import ContextMenu from './components/ContextMenu';
import FloatingPollCard from './components/FloatingPollCard';
import { DropPlaceholder } from './components/DropPlaceholder';


// Helper to generate a unique ID
const generateUniqueId = () => crypto.randomUUID().substring(0, 8);

type Theme = 'light' | 'dark';

// Helper function to re-index poll order within a category
const reorderCategory = (polls: Polls, categoryId: string): Polls => {
    const newPolls = { ...polls };
    const categoryPolls = (Object.values(newPolls) as Poll[])
        .filter(p => p.category === categoryId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    categoryPolls.forEach((p, index) => {
        newPolls[p.id] = { ...p, order: (index + 1) * 10 };
    });
    return newPolls;
};


const App: React.FC = () => {
    const [polls, setPolls] = useState<Polls>({});
    const [templates, setTemplates] = useState<Template[]>([]);
    const [collapsedState, setCollapsedState] = useState<Map<string, boolean>>(new Map());
    const [lastDeletedPoll, setLastDeletedPoll] = useState<{ id: string; data: Poll } | null>(null);
    const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [newPollCategory, setNewPollCategory] = useState<string | null>(null);
    const [theme, setTheme] = useState<Theme>('light');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; poll: Poll } | null>(null);
    const [stickiedPoll, setStickiedPoll] = useState<{ poll: Poll; x: number; y: number } | null>(null);
    const [dropPlaceholder, setDropPlaceholder] = useState<{ categoryId: string; order: number } | null>(null);
    const [dragInfo, setDragInfo] = useState<{ pollId: string; startX: number; startY: number; } | null>(null);


    const [confirmAction, setConfirmAction] = useState<{
        title: string;
        message: string;
        confirmText: string;
        onConfirm: () => void;
    } | null>(null);

    // Load data and theme from localStorage on initial render
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

        const storedTheme = localStorage.getItem('theme') as Theme | null;
        if (storedTheme) {
            setTheme(storedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
    }, []);

    // Effect to apply and save theme
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Add class to body to prevent text selection during drag
    useEffect(() => {
        if (stickiedPoll) {
            document.body.classList.add('is-dragging');
        } else {
            document.body.classList.remove('is-dragging');
        }
        // Cleanup function
        return () => document.body.classList.remove('is-dragging');
    }, [stickiedPoll]);


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

    // Effect to close context menu on any click
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);
    
    const hideUndoBar = useCallback(() => {
        setLastDeletedPoll(null);
    }, []);

    const handleOpenAddModal = useCallback((categoryId?: string) => {
        hideUndoBar();
        setEditingPoll(null);
        setNewPollCategory(categoryId || null);
        setIsAddModalOpen(true);
    }, [hideUndoBar]);
    
    const handleOpenEditModal = useCallback((pollId: string) => {
        hideUndoBar();
        setEditingPoll(polls[pollId]);
        setNewPollCategory(null);
        setIsAddModalOpen(true);
    }, [polls, hideUndoBar]);

    const handleStickyDrop = useCallback(() => {
        if (!stickiedPoll || !dropPlaceholder) {
            setStickiedPoll(null);
            setDropPlaceholder(null);
            return;
        };
    
        const pollId = stickiedPoll.poll.id;
        const { categoryId, order } = dropPlaceholder;
    
        setPolls(prevPolls => {
            const sourceCategory = prevPolls[pollId].category;
            const newPolls = { ...prevPolls };
            // Update poll's category and order
            newPolls[pollId] = { ...newPolls[pollId], category: categoryId, order: order };
            
            // Re-order polls in target category
            let reorderedPolls = reorderCategory(newPolls, categoryId);
            
            // If category changed, also re-order polls in source category
            if (sourceCategory !== categoryId) {
                reorderedPolls = reorderCategory(reorderedPolls, sourceCategory);
            }
            
            return reorderedPolls;
        });
    
        setStickiedPoll(null);
        setDropPlaceholder(null);
    }, [stickiedPoll, dropPlaceholder]);

    const handleStickyMove = useCallback((e: MouseEvent) => {
        if (!stickiedPoll) return;
    
        setStickiedPoll(p => p ? { ...p, x: e.clientX, y: e.clientY } : null);
    
        const targetElement = document.elementFromPoint(e.clientX, e.clientY);
        const columnContentElement = targetElement?.closest<HTMLElement>('.column-content');
    
        if (!columnContentElement) {
            setDropPlaceholder(null);
            return;
        }
    
        const categoryId = columnContentElement.dataset.categoryId;
        if (!categoryId) {
            setDropPlaceholder(null);
            return;
        }
    
        const stickiedPollId = stickiedPoll.poll.id;
        const pollsInCategory = (Object.values(polls) as Poll[])
            .filter(p => p.category === categoryId && p.id !== stickiedPollId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    
        // Find the element to insert before by iterating through DOM nodes for visual accuracy
        let nextElement: HTMLElement | null = null;
        const pollCards = Array.from(columnContentElement.querySelectorAll<HTMLElement>('[data-poll-id]'));
    
        for (const child of pollCards) {
            const rect = child.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            
            if (e.clientY < midY) {
                nextElement = child;
                break;
            }
        }
    
        let targetOrder: number;
        if (nextElement) {
            // We are inserting before `nextElement`
            const nextPollId = nextElement.dataset.pollId;
            const nextPoll = polls[nextPollId!];
            
            const nextPollIndex = pollsInCategory.findIndex(p => p.id === nextPollId);
            const prevPoll = nextPollIndex > 0 ? pollsInCategory[nextPollIndex - 1] : null;
    
            const prevOrder = prevPoll ? (prevPoll.order || 0) : 0;
            const nextOrder = nextPoll.order || 0;
            
            targetOrder = (prevOrder + nextOrder) / 2;
        } else {
            // We are inserting at the end
            const lastPoll = pollsInCategory[pollsInCategory.length - 1];
            targetOrder = lastPoll ? (lastPoll.order || 0) + 10 : 10;
        }
    
        setDropPlaceholder({ categoryId, order: targetOrder });
    
    }, [stickiedPoll, polls]);

    const handleStartStickyMove = useCallback(() => {
        if (!contextMenu) return;
        setStickiedPoll({ poll: contextMenu.poll, x: contextMenu.x, y: contextMenu.y });
    }, [contextMenu]);

    // Effect to handle click vs. drag initiation
    useEffect(() => {
        if (!dragInfo) return;

        const handleMouseMove = (e: MouseEvent) => {
            // If already dragging (stickied), this listener's job is done.
            if (stickiedPoll) return;

            // Not dragging yet, check threshold
            const DRAG_THRESHOLD = 5;
            const dx = e.clientX - dragInfo.startX;
            const dy = e.clientY - dragInfo.startY;
            if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
                setStickiedPoll({ poll: polls[dragInfo.pollId], x: e.clientX, y: e.clientY });
            }
        };

        const handleMouseUp = () => {
             // If a drag never started, it was a click.
            if (!stickiedPoll) {
                handleOpenEditModal(dragInfo.pollId);
            }
            // The drop itself is handled by the other useEffect.
            // We just need to clear the drag initiation state.
            setDragInfo(null);
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp, { once: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragInfo, stickiedPoll, polls, handleOpenEditModal]);

    // Effect to handle active dragging (moving and dropping the stickied card)
    useEffect(() => {
        if (!stickiedPoll) return;

        const handleMouseUpForDrop = (e: MouseEvent) => {
             // Only drop on left-click mouseup
            if (e.button === 0) {
                handleStickyDrop();
            }
        };

        // handleStickyMove is a useCallback, so it's safe to use here.
        window.addEventListener('mousemove', handleStickyMove);
        window.addEventListener('mouseup', handleMouseUpForDrop);

        return () => {
            window.removeEventListener('mousemove', handleStickyMove);
            window.removeEventListener('mouseup', handleMouseUpForDrop);
        };
    }, [stickiedPoll, handleStickyMove, handleStickyDrop]);

    const handlePollMouseDown = (event: React.MouseEvent, pollId: string) => {
        // Prevent starting a drag on right-click
        if (event.button !== 0) return;
        
        setDragInfo({
          pollId,
          startX: event.clientX,
          startY: event.clientY,
        });
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
                const currentPolls = (Object.values(newPolls) as Poll[]).filter(p => p.category === category);
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
        };
        
        setPolls(prevPolls => {
            const newPolls = { ...prevPolls };
            const categoryPolls = (Object.values(prevPolls) as Poll[])
                .filter(p => p.category === originalPoll.category)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            
            const originalIndex = categoryPolls.findIndex(p => p.id === pollId);
            categoryPolls.splice(originalIndex + 1, 0, newPollData);

            categoryPolls.forEach((p, index) => {
                newPolls[p.id] = { ...p, order: (index + 1) * 10 };
            });

            return newPolls;
        });
    };

    const handleMovePoll = (pollId: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
        hideUndoBar();
        setPolls(prevPolls => {
            const targetPoll = prevPolls[pollId];
            if (!targetPoll) return prevPolls;
    
            const categoryPolls = (Object.values(prevPolls) as Poll[])
                .filter(p => p.category === targetPoll.category)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            
            const currentIndex = categoryPolls.findIndex(p => p.id === pollId);
            if (currentIndex === -1) return prevPolls;
    
            let newIndex = currentIndex;
            if (direction === 'up') newIndex = Math.max(0, currentIndex - 1);
            else if (direction === 'down') newIndex = Math.min(categoryPolls.length - 1, currentIndex + 1);
            else if (direction === 'top') newIndex = 0;
            else if (direction === 'bottom') newIndex = categoryPolls.length - 1;
            
            if (newIndex === currentIndex) return prevPolls;
    
            const [movedItem] = categoryPolls.splice(currentIndex, 1);
            categoryPolls.splice(newIndex, 0, movedItem);
    
            const newPolls = { ...prevPolls };
            categoryPolls.forEach((p, index) => {
                if (newPolls[p.id]) {
                    newPolls[p.id].order = (index + 1) * 10;
                }
            });
    
            return newPolls;
        });
    };

    const handlePollContextMenu = (event: React.MouseEvent, poll: Poll) => {
        event.preventDefault();
        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            poll: poll,
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
    
    const handleSaveTemplates = (updatedTemplates: Template[]) => {
        setTemplates(updatedTemplates);
        setIsTemplateModalOpen(false);
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
            
            <UndoBar lastDeletedPoll={lastDeletedPoll} onUndo={handleUndoDelete} />

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
                    onClose={() => setContextMenu(null)}
                    onDuplicate={() => handleDuplicatePoll(contextMenu.poll.id)}
                    onDelete={() => handleDeletePoll(contextMenu.poll.id)}
                    onStickyMove={handleStartStickyMove}
                    onMoveUp={() => handleMovePoll(contextMenu.poll.id, 'up')}
                    onMoveDown={() => handleMovePoll(contextMenu.poll.id, 'down')}
                    onMoveToTop={() => handleMovePoll(contextMenu.poll.id, 'top')}
                    onMoveToBottom={() => handleMovePoll(contextMenu.poll.id, 'bottom')}
                 />
            )}
            
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
        </div>
    );
};

export default App;