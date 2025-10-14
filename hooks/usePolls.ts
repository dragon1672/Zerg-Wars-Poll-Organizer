import { useState, useEffect, useCallback } from 'react';
import type { Poll, Polls } from '../types';
import { STORAGE_KEY, basePollsData } from '../constants';

const generateUniqueId = () => crypto.randomUUID().substring(0, 8);

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

export const usePolls = () => {
    const [polls, setPolls] = useState<Polls>({});
    const [lastDeletedPoll, setLastDeletedPoll] = useState<{ id: string; data: Poll } | null>(null);

    useEffect(() => {
        try {
            const storedPolls = localStorage.getItem(STORAGE_KEY);
            setPolls(storedPolls ? JSON.parse(storedPolls) : basePollsData);
        } catch (e) {
            console.error("Error loading data from Local Storage. Starting fresh.", e);
            setPolls(basePollsData);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
        } catch (e) {
            console.error("Error saving poll data to Local Storage:", e);
        }
    }, [polls]);

    const hideUndoBar = useCallback(() => {
        setLastDeletedPoll(null);
    }, []);

    const savePoll = (pollData: Omit<Poll, 'id' | 'order'>, pollId?: string, newPollCategory?: string | null) => {
        hideUndoBar();
        setPolls(prevPolls => {
            let newPolls = { ...prevPolls };
            if (pollId) { // Update existing poll
                const oldCategory = newPolls[pollId].category;
                newPolls[pollId] = { ...newPolls[pollId], ...pollData };
                
                if (oldCategory !== pollData.category) {
                   // Reorder both categories if it changed
                   newPolls = reorderCategory(newPolls, oldCategory);
                   newPolls = reorderCategory(newPolls, pollData.category);
                }
            } else { // Create new poll
                const newId = `poll_${generateUniqueId()}`;
                const category = newPollCategory || pollData.category;
                const currentPolls = (Object.values(newPolls) as Poll[]).filter(p => p.category === category);
                const maxOrder = currentPolls.length > 0 ? Math.max(...currentPolls.map(p => p.order || 0)) : 0;
                newPolls[newId] = { ...pollData, category, id: newId, order: maxOrder + 10, tags: pollData.tags || [] };
            }
            return newPolls;
        });
    };

    const deletePoll = (pollId: string) => {
        if (!polls[pollId]) return;
        setLastDeletedPoll({ id: pollId, data: { ...polls[pollId] } });
        setPolls(prevPolls => {
            const newPolls = { ...prevPolls };
            delete newPolls[pollId];
            return newPolls;
        });
    };

    const undoDelete = () => {
        if (!lastDeletedPoll) return;
        setPolls(prevPolls => ({
            ...prevPolls,
            [lastDeletedPoll.id]: lastDeletedPoll.data
        }));
        hideUndoBar();
    };

    const duplicatePoll = (pollId: string) => {
        hideUndoBar();
        const originalPoll = polls[pollId];
        if (!originalPoll) return;

        const newId = `poll_${generateUniqueId()}`;
        const newPollData = {
            ...originalPoll,
            id: newId,
            tags: [...(originalPoll.tags || [])]
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

    const movePoll = (pollId: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
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

    const handlePollDrop = (pollId: string, categoryId: string, order: number) => {
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
    };

    const deleteAllPolls = () => {
        setPolls({});
        hideUndoBar();
    };

    const resetPolls = () => {
        setPolls(basePollsData);
        hideUndoBar();
    };

    return { polls, setPolls, lastDeletedPoll, hideUndoBar, savePoll, deletePoll, undoDelete, duplicatePoll, movePoll, handlePollDrop, deleteAllPolls, resetPolls };
};
