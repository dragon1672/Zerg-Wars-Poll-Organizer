import React from 'react';
import type { Poll } from '../types';

interface UndoBarProps {
    lastDeletedPoll: { id: string; data: Poll } | null;
    onUndo: () => void;
}

const UndoBar: React.FC<UndoBarProps> = ({ lastDeletedPoll, onUndo }) => {
    if (!lastDeletedPoll) {
        return null;
    }

    return (
        <div className="mx-4 p-3 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-400 dark:border-yellow-600/50 rounded-lg flex justify-between items-center animate-fade-in">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                A poll was deleted. 
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">Clicking undo will restore the last deleted poll.</span>
            </p>
            <button onClick={onUndo} className="px-4 py-1 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700">Undo</button>
        </div>
    );
};

export default UndoBar;