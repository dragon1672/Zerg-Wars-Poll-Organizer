import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Poll, Polls } from './types';
import { STORAGE_KEY, COLLAPSE_KEY, columnCategories, basePollsData, categoryOrderMap } from './constants';
import Header from './components/Header';
import UndoBar from './components/UndoBar';
import Column from './components/Column';
import PollModal from './components/PollModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';

// Helper to generate a unique ID
const generateUniqueId = () => crypto.randomUUID().substring(0, 8);

const App: React.FC = () => {
    const [polls, setPolls] = useState<Polls>({});
    const [collapsedState, setCollapsedState] = useState<Map<string, boolean>>(new Map());
    const [lastDeletedPoll, setLastDeletedPoll] = useState<{ id: string; data: Poll } | null>(null);
    const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load data from localStorage on initial render
    useEffect(() => {
        try {
            const storedPolls = localStorage.getItem(STORAGE_KEY);
            setPolls(storedPolls ? JSON.parse(storedPolls) : basePollsData);

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

    const handleOpenAddModal = () => {
        hideUndoBar();
        setEditingPoll(null);
        setIsAddModalOpen(true);
    };
    
    const handleOpenEditModal = (pollId: string) => {
        hideUndoBar();
        setEditingPoll(polls[pollId]);
        setIsAddModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingPoll(null);
    };

    const handleSavePoll = (pollData: Omit<Poll, 'id' | 'order'>, pollId?: string) => {
        setPolls(prevPolls => {
            const newPolls = { ...prevPolls };
            if (pollId) { // Update existing poll
                newPolls[pollId] = { ...newPolls[pollId], ...pollData };
            } else { // Create new poll
                const newId = `poll_${generateUniqueId()}`;
                // FIX: Add explicit type to `p` to resolve `unknown` type error from `Object.values`.
                const currentPolls = Object.values(newPolls).filter((p: Poll) => p.category === pollData.category);
                // FIX: Add explicit type to `p` to resolve `unknown` type error from `Object.values`.
                const maxOrder = currentPolls.length > 0 ? Math.max(...currentPolls.map(p => p.order || 0)) : 0;
                newPolls[newId] = { ...pollData, id: newId, order: maxOrder + 10 };
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

    const handleDeleteAllPolls = () => {
        hideUndoBar();
        setPolls({});
        setIsConfirmDeleteOpen(false);
    };

    const handleExport = () => {
        let exportText = "";
        // FIX: Add explicit types to `a` and `b` to resolve `unknown` type error from `Object.values`.
        const sortedPolls = Object.values(polls).sort((a: Poll, b: Poll) => {
            const catAOrder = categoryOrderMap.get(a.category) ?? 999;
            const catBOrder = categoryOrderMap.get(b.category) ?? 999;
            if (catAOrder !== catBOrder) return catAOrder - catBOrder;
            return (a.order || 0) - (b.order || 0);
        });

        // FIX: The `sortedPolls` variable is now correctly typed as `Poll[]`, which resolves `unknown` type errors for `poll` below.
        sortedPolls.forEach((poll) => {
            exportText += `${poll.description}\n`;
            if (poll.options && poll.options.length > 0) {
                poll.options.forEach((option, index) => {
                    exportText += `${index + 1}. ${option.text.trim()}\n`;
                });
            }
            exportText += `\n`;
        });

        const blob = new Blob([exportText.trim() + '\n'], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Zerg_Wars_Polls_${new Date().toISOString().substring(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const handleSaveProject = () => {
        try {
            const dataStr = JSON.stringify(polls, null, 2);
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
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File could not be read.");
                }
                const data = JSON.parse(text);

                // Basic validation
                if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
                    setPolls(data as Polls);
                    alert('Project loaded successfully!');
                } else {
                    throw new Error("Invalid file format.");
                }
            } catch (error) {
                console.error("Error loading project:", error);
                alert("Failed to load project. The file may be corrupt or in the wrong format.");
            } finally {
                // Reset file input to allow loading the same file again
                if(event.target) {
                    event.target.value = '';
                }
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

            // Update category if changed
            if (newPolls[pollId] && newPolls[pollId].category !== newCategoryId) {
                newPolls[pollId].category = newCategoryId;
            }

            // Update order for all polls in the affected column
            orderedIds.forEach((id, index) => {
                if (newPolls[id]) {
                    newPolls[id].order = (index + 1) * 10;
                }
            });
            return newPolls;
        });
    }, [hideUndoBar]);

    const collapsedCategories = columnCategories.filter(col => collapsedState.get(col.id));
    const expandedCategories = columnCategories.filter(col => !collapsedState.get(col.id));

    return (
        <>
            <Header
                onAddPoll={handleOpenAddModal}
                onExport={handleExport}
                onSaveProject={handleSaveProject}
                onTriggerLoad={() => fileInputRef.current?.click()}
                onDeleteAll={() => setIsConfirmDeleteOpen(true)}
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
                                    {/* FIX: Add explicit type to `p` to resolve `unknown` type error from `Object.values`. */}
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
                            // FIX: Add explicit types to parameters to resolve `unknown` type error from `Object.values`.
                            polls={Object.values(polls).filter((p: Poll) => p.category === category.id).sort((a: Poll, b: Poll) => (a.order || 0) - (b.order || 0))}
                            onToggleCollapse={handleToggleCollapse}
                            onEditPoll={handleOpenEditModal}
                            onDeletePoll={handleDeletePoll}
                            onDuplicatePoll={handleDuplicatePoll}
                            onPollDrop={handlePollDrop}
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
                />
            )}

            {isConfirmDeleteOpen && (
                <ConfirmDeleteModal
                    onConfirm={handleDeleteAllPolls}
                    onClose={() => setIsConfirmDeleteOpen(false)}
                />
            )}
        </>
    );
};

export default App;