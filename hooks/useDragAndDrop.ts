import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Poll, Polls } from '../types';

interface UseDragAndDropProps {
    polls: Polls;
    onDrop: (pollId: string, categoryId: string, order: number) => void;
    onClick: (pollId: string) => void;
}

export const useDragAndDrop = ({ polls, onDrop, onClick }: UseDragAndDropProps) => {
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; poll: Poll } | null>(null);
    const [stickiedPoll, setStickiedPoll] = useState<{ poll: Poll; x: number; y: number } | null>(null);
    const [dropPlaceholder, setDropPlaceholder] = useState<{ categoryId: string; order: number } | null>(null);
    const [dragInfo, setDragInfo] = useState<{ pollId: string; startX: number; startY: number; } | null>(null);
    const isDraggingRef = useRef(false);

    const pollsRef = useRef(polls);
    useEffect(() => {
        pollsRef.current = polls;
    }, [polls]);

    // Add class to body to prevent text selection during drag
    useEffect(() => {
        if (stickiedPoll) {
            document.body.classList.add('is-dragging');
        } else {
            document.body.classList.remove('is-dragging');
        }
        return () => document.body.classList.remove('is-dragging');
    }, [stickiedPoll]);

    const handleStickyDrop = useCallback(() => {
        if (!stickiedPoll || !dropPlaceholder) {
            setStickiedPoll(null);
            setDropPlaceholder(null);
            return;
        };
    
        const pollId = stickiedPoll.poll.id;
        const { categoryId, order } = dropPlaceholder;
        onDrop(pollId, categoryId, order);
    
        setStickiedPoll(null);
        setDropPlaceholder(null);
    }, [stickiedPoll, dropPlaceholder, onDrop]);

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
    
        const currentPolls = pollsRef.current;
        const stickiedPollId = stickiedPoll.poll.id;
        const pollsInCategory = (Object.values(currentPolls) as Poll[])
            .filter(p => p.category === categoryId && p.id !== stickiedPollId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    
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
            const nextPollId = nextElement.dataset.pollId;
            const nextPoll = currentPolls[nextPollId!];
            
            const nextPollIndex = pollsInCategory.findIndex(p => p.id === nextPollId);
            const prevPoll = nextPollIndex > 0 ? pollsInCategory[nextPollIndex - 1] : null;
    
            const prevOrder = prevPoll ? (prevPoll.order || 0) : 0;
            const nextOrder = nextPoll.order || 0;
            
            targetOrder = (prevOrder + nextOrder) / 2;
        } else {
            const lastPoll = pollsInCategory[pollsInCategory.length - 1];
            targetOrder = lastPoll ? (lastPoll.order || 0) + 10 : 10;
        }
    
        setDropPlaceholder({ categoryId, order: targetOrder });
    
    }, [stickiedPoll]);

    const handleStartStickyMoveFromContextMenu = useCallback(() => {
        if (!contextMenu) return;
        setStickiedPoll({ poll: contextMenu.poll, x: contextMenu.x, y: contextMenu.y });
        setContextMenu(null);
    }, [contextMenu]);
    
    const clickHandlerRef = useRef(onClick);
    useEffect(() => {
        clickHandlerRef.current = onClick;
    }, [onClick]);

    // Effect to handle click vs. drag initiation
    useEffect(() => {
        if (!dragInfo) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingRef.current) return;

            const DRAG_THRESHOLD = 5;
            const dx = e.clientX - dragInfo.startX;
            const dy = e.clientY - dragInfo.startY;
            if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
                const currentPolls = pollsRef.current;
                if (!currentPolls[dragInfo.pollId]) {
                    setDragInfo(null);
                    return;
                }
                isDraggingRef.current = true;
                setStickiedPoll({ poll: currentPolls[dragInfo.pollId], x: e.clientX, y: e.clientY });
            }
        };

        const handleMouseUp = () => {
            if (!isDraggingRef.current) {
                clickHandlerRef.current(dragInfo.pollId);
            }
            setDragInfo(null);
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp, { once: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragInfo]);


    // Effect to handle active dragging (moving and dropping the stickied card)
    useEffect(() => {
        if (!stickiedPoll) return;

        const handleMouseUpForDrop = (e: MouseEvent) => {
             if (e.button === 0) {
                handleStickyDrop();
            }
        };

        window.addEventListener('mousemove', handleStickyMove);
        window.addEventListener('mouseup', handleMouseUpForDrop);

        return () => {
            window.removeEventListener('mousemove', handleStickyMove);
            window.removeEventListener('mouseup', handleMouseUpForDrop);
        };
    }, [stickiedPoll, handleStickyMove, handleStickyDrop]);

    const handlePollMouseDown = (event: React.MouseEvent, pollId: string) => {
        if (event.button !== 0 || stickiedPoll) return;
        
        isDraggingRef.current = false;
        setDragInfo({
          pollId,
          startX: event.clientX,
          startY: event.clientY,
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
    
    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, []);

    useEffect(() => {
        window.addEventListener('click', closeContextMenu);
        return () => window.removeEventListener('click', closeContextMenu);
    }, [closeContextMenu]);


    return {
        stickiedPoll,
        dropPlaceholder,
        contextMenu,
        handlePollMouseDown,
        handlePollContextMenu,
        closeContextMenu,
        handleStartStickyMoveFromContextMenu
    };
};