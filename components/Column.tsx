
import React, { useEffect, useRef } from 'react';
import type { Poll, Category } from '../types';
import PollCard from './PollCard';
import type { SortableEvent } from 'sortablejs';

// SortableJS is loaded from CDN, so we need to declare it for TypeScript
declare const Sortable: any;

interface ColumnProps {
    category: Category;
    polls: Poll[];
    onToggleCollapse: (id: string) => void;
    onEditPoll: (id: string) => void;
    onDeletePoll: (id: string) => void;
    onDuplicatePoll: (id: string) => void;
    onPollDrop: (pollId: string, newCategoryId: string, orderedIds: string[]) => void;
}

const Column: React.FC<ColumnProps> = ({ category, polls, onToggleCollapse, onEditPoll, onDeletePoll, onDuplicatePoll, onPollDrop }) => {
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
                    const newCategoryEl = evt.to.closest('.expanded-column');
                    
                    if (!pollId || !newCategoryEl) return;
                    
                    const newCategoryId = newCategoryEl.dataset.categoryId;
                    if (!newCategoryId) return;

                    const orderedIds = Array.from(evt.to.children)
                        .map(el => (el as HTMLElement).dataset.pollId)
                        .filter((id): id is string => !!id);
                    
                    onPollDrop(pollId, newCategoryId, orderedIds);
                },
            });
        }
        
        // Cleanup function to destroy Sortable instance
        return () => {
            if (sortableInstance.current) {
                sortableInstance.current.destroy();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={`expanded-column flex-shrink-0 w-full md:w-auto md:min-w-[300px] md:flex-1 bg-white shadow-xl rounded-xl border-l-4 ${category.border}`} data-category-id={category.id}>
            <div className="p-3 cursor-pointer select-none bg-gray-50 rounded-t-xl flex justify-between items-center border-b" onClick={() => onToggleCollapse(category.id)}>
                <h2 className="text-lg font-bold text-gray-800">{category.title} ({polls.length})</h2>
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
            </div>
            <div ref={contentRef} className={`min-h-[100px] ${category.color} rounded-b-xl p-1`}>
                {polls.map(poll => (
                    <PollCard 
                        key={poll.id} 
                        poll={poll}
                        onEdit={onEditPoll}
                        onDelete={onDeletePoll}
                        onDuplicate={onDuplicatePoll}
                    />
                ))}
            </div>
        </div>
    );
};

export default Column;
