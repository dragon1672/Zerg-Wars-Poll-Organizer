import React, { useEffect, useRef } from 'react';
import type { Poll, Category } from '../types';
import PollCard from './PollCard';
import type { SortableEvent } from 'sortablejs';
import { DropPlaceholder } from './DropPlaceholder';

// SortableJS is loaded from CDN, so we need to declare it for TypeScript
declare const Sortable: any;

interface ColumnProps {
    category: Category;
    polls: Poll[];
    onToggleCollapse: (id: string) => void;
    onEditPoll: (id: string) => void;
    onPollDrop: (pollId: string, oldCategoryId: string, newCategoryId: string, orderedIds: string[]) => void;
    onAddPollToCategory: (categoryId: string) => void;
    onPollContextMenu: (event: React.MouseEvent, poll: Poll) => void;
    stickiedPollId: string | null;
    dropPlaceholder: { categoryId: string; order: number } | null;
}

const Column: React.FC<ColumnProps> = ({ category, polls, onToggleCollapse, onEditPoll, onPollDrop, onAddPollToCategory, onPollContextMenu, stickiedPollId, dropPlaceholder }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const sortableInstance = useRef<any>(null);

    useEffect(() => {
        if (contentRef.current) {
            sortableInstance.current = new Sortable(contentRef.current, {
                group: 'polls',
                animation: 150,
                draggable: 'div[data-poll-id]',
                onEnd: (evt: SortableEvent) => {
                    const pollId = evt.item.dataset.pollId;
                    const toCategoryEl = (evt.to as HTMLElement).closest('.expanded-column');
                    const fromCategoryEl = (evt.from as HTMLElement).closest('.expanded-column');
                    
                    if (!pollId || !toCategoryEl || !fromCategoryEl) return;
                    
                    const newCategoryId = (toCategoryEl as HTMLElement).dataset.categoryId;
                    const oldCategoryId = (fromCategoryEl as HTMLElement).dataset.categoryId;

                    if (!newCategoryId || !oldCategoryId) {
                        console.error("Could not determine category IDs on drop.");
                        return;
                    }

                    const orderedIds = Array.from(evt.to.children)
                        .map(el => (el as HTMLElement).dataset.pollId)
                        .filter((id): id is string => !!id);
                    
                    onPollDrop(pollId, oldCategoryId, newCategoryId, orderedIds);
                },
            });
        }
        
        return () => {
            if (sortableInstance.current) {
                sortableInstance.current.destroy();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    let placeholderInserted = false;

    return (
        <div className={`expanded-column flex-shrink-0 w-full md:w-[320px] bg-white dark:bg-gray-800 shadow-xl rounded-xl border-l-4 ${category.border} flex flex-col`} data-category-id={category.id}>
            <div className="p-3 cursor-pointer select-none bg-gray-50 dark:bg-gray-700/50 rounded-t-xl flex justify-between items-center border-b dark:border-gray-700 flex-shrink-0" onClick={() => onToggleCollapse(category.id)}>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{category.title} ({polls.length})</h2>
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
            </div>
            <div className={`flex flex-col ${category.color} dark:bg-opacity-30 rounded-b-xl flex-grow min-h-0`}>
                <div ref={contentRef} className="p-1 flex-grow column-content overflow-y-auto" data-category-id={category.id}>
                     {polls.map(poll => {
                        if (dropPlaceholder && dropPlaceholder.categoryId === category.id && dropPlaceholder.order < (poll.order || 0) && !placeholderInserted) {
                            placeholderInserted = true;
                            return (
                                <React.Fragment key="placeholder-wrapper">
                                    <DropPlaceholder />
                                    <PollCard
                                        key={poll.id} 
                                        poll={poll}
                                        onEdit={onEditPoll}
                                        onContextMenu={onPollContextMenu}
                                        isStickied={poll.id === stickiedPollId}
                                    />
                                </React.Fragment>
                            );
                        }
                         return (
                            <PollCard 
                                key={poll.id} 
                                poll={poll}
                                onEdit={onEditPoll}
                                onContextMenu={onPollContextMenu}
                                isStickied={poll.id === stickiedPollId}
                            />
                        );
                    })}
                    {dropPlaceholder && dropPlaceholder.categoryId === category.id && !placeholderInserted && (
                        <DropPlaceholder />
                    )}
                </div>
                <div className="p-2 border-t border-black/10 dark:border-white/10 flex-shrink-0">
                    <button 
                        onClick={() => onAddPollToCategory(category.id)} 
                        className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-300/60 dark:hover:bg-gray-700/60 rounded-lg p-2 transition-colors">
                        + Add a poll
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Column;