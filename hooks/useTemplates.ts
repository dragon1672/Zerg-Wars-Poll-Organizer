import { useState, useEffect } from 'react';
import type { Template } from '../types';
import { TEMPLATE_STORAGE_KEY, baseTemplatesData } from '../constants';

export const useTemplates = () => {
    const [templates, setTemplates] = useState<Template[]>([]);

    useEffect(() => {
        try {
            const storedTemplates = localStorage.getItem(TEMPLATE_STORAGE_KEY);
            setTemplates(storedTemplates ? JSON.parse(storedTemplates) : baseTemplatesData);
        } catch (e) {
            console.error("Error loading templates from Local Storage. Starting fresh.", e);
            setTemplates(baseTemplatesData);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
        } catch(e) {
             console.error("Error saving templates to Local Storage:", e);
        }
    }, [templates]);

    const saveTemplates = (updatedTemplates: Template[]) => {
        setTemplates(updatedTemplates);
    };
    
    const resetTemplates = () => {
        setTemplates(baseTemplatesData);
    };

    return { templates, saveTemplates, resetTemplates };
};
