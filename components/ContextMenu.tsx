import React from 'react';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onMoveToTop: () => void;
    onMoveToBottom: () => void;
    onSticky: () => void;
}

const ContextMenuItem: React.FC<{ onClick: (e: React.MouseEvent) => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className = '' }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-3 ${className}`}
    >
        {children}
    </button>
);

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onDuplicate, onDelete, onMoveUp, onMoveDown, onMoveToTop, onMoveToBottom, onSticky }) => {
    const style = { top: y, left: x };

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
        onClose();
    };

    return (
        <div
            style={style}
            className="fixed bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 w-56 py-1"
        >
            <ContextMenuItem onClick={(e) => handleAction(e, onDuplicate)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h.01M16 7h.01M16 7v8a2 2 0 002 2h2a2 2 0 002-2v-4"></path></svg>
                Duplicate
            </ContextMenuItem>
            <ContextMenuItem onClick={(e) => handleAction(e, onSticky)}>
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.374a15.28 15.28 0 0 1-3.08-3.08-15.28 15.28 0 0 1-3.08-3.08A15.28 15.28 0 0 1 3 9.174a15.28 15.28 0 0 1 3.08-3.08A15.28 15.28 0 0 1 9.174 3a15.28 15.28 0 0 1 3.08 3.08A15.28 15.28 0 0 1 18.338 9.174a15.28 15.28 0 0 1-3.08 3.08A15.28 15.28 0 0 1 9.174 18.338a15.28 15.28 0 0 1-3.08 3.08Z" /></svg>
                Sticky Move
            </ContextMenuItem>
            <div className="border-t my-1 border-gray-200 dark:border-gray-600"></div>
            <ContextMenuItem onClick={(e) => handleAction(e, onMoveUp)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                Move Up
            </ContextMenuItem>
            <ContextMenuItem onClick={(e) => handleAction(e, onMoveDown)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                Move Down
            </ContextMenuItem>
            <ContextMenuItem onClick={(e) => handleAction(e, onMoveToTop)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7M5 3h14"></path></svg>
                Move to Top
            </ContextMenuItem>
            <ContextMenuItem onClick={(e) => handleAction(e, onMoveToBottom)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7M5 21h14"></path></svg>
                Move to Bottom
            </ContextMenuItem>
            <div className="border-t my-1 border-gray-200 dark:border-gray-600"></div>
            <ContextMenuItem onClick={(e) => handleAction(e, onDelete)} className="text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                 <span>Delete</span>
            </ContextMenuItem>
        </div>
    );
};

export default ContextMenu;