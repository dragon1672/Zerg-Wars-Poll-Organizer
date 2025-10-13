import { useState, useEffect } from 'react';
import { COLLAPSE_KEY, columnCategories } from '../constants';

export const useColumnCollapse = () => {
    const [collapsedState, setCollapsedState] = useState<Map<string, boolean>>(() => {
        try {
            const storedCollapseState = localStorage.getItem(COLLAPSE_KEY);
            if (storedCollapseState) {
                return new Map(JSON.parse(storedCollapseState));
            }
        } catch (e) {
            console.error("Error loading collapse state from Local Storage.", e);
        }
        const defaultCollapseState = new Map();
        columnCategories.forEach(cat => defaultCollapseState.set(cat.id, true));
        return defaultCollapseState;
    });

    useEffect(() => {
        try {
            localStorage.setItem(COLLAPSE_KEY, JSON.stringify(Array.from(collapsedState.entries())));
        } catch (e) {
            console.error("Error saving collapse state to Local Storage:", e);
        }
    }, [collapsedState]);

    const toggleCollapse = (categoryId: string) => {
        setCollapsedState(prev => {
            const newState = new Map(prev);
            newState.set(categoryId, !newState.get(categoryId));
            return newState;
        });
    };

    return { collapsedState, toggleCollapse };
};
