
import React, { useState, useEffect, useRef } from 'react';

interface HeaderProps {
    onAddPoll: () => void;
    onExport: (format: 'text' | 'ahk') => void;
    onDownloadAhkScript: () => void;
    onSaveProject: () => void;
    onTriggerLoad: () => void;
    onResetToDefaults: () => void;
    onDeletePolls: () => void;
    onDeleteAll: () => void;
    onManageTemplates: () => void;
}

const Dropdown: React.FC<{
    buttonText: string;
    buttonClasses: string;
    children: React.ReactNode;
}> = ({ buttonText, buttonClasses, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className={buttonClasses}>
                {buttonText}
                <svg className="w-4 h-4 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-30">
                    <div className="py-1" role="menu" aria-orientation="vertical" onClick={() => setIsOpen(false)}>
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ 
    onAddPoll, onExport, onDownloadAhkScript, onSaveProject, onTriggerLoad, 
    onResetToDefaults, onDeletePolls, onDeleteAll, onManageTemplates 
}) => {
    
    const baseButtonClasses = "px-4 py-2 font-semibold rounded-xl shadow-lg transition flex items-center justify-center";
    const dropdownItemClasses = "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100";

    return (
        <header className="p-4 bg-white shadow-md mb-4 sticky top-0 z-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <h1 className="text-3xl font-extrabold text-indigo-700">Zerg Wars Poll Organizer</h1>
                <div className="flex flex-wrap gap-3 mt-4 md:mt-0 items-center">
                    <button onClick={onAddPoll} className={`${baseButtonClasses} bg-indigo-600 text-white hover:bg-indigo-700`}> + Add Poll </button>
                    <button onClick={onManageTemplates} className={`${baseButtonClasses} bg-purple-600 text-white hover:bg-purple-700`}> Manage Templates </button>
                    
                    <Dropdown buttonText="Project" buttonClasses={`${baseButtonClasses} bg-blue-600 text-white hover:bg-blue-700`}>
                         <button onClick={onSaveProject} className={dropdownItemClasses}> Save Project (.json) </button>
                         <button onClick={onTriggerLoad} className={dropdownItemClasses}> Load Project (.json) </button>
                    </Dropdown>
                    
                     <Dropdown buttonText="Export" buttonClasses={`${baseButtonClasses} bg-green-600 text-white hover:bg-green-700`}>
                        <button onClick={() => onExport('text')} className={dropdownItemClasses}> Export as Text (.txt) </button>
                        <button onClick={() => onExport('ahk')} className={dropdownItemClasses}> Export for AutoHotKey (.txt) </button>
                        <div className="border-t my-1"></div>
                        <button onClick={onDownloadAhkScript} className={dropdownItemClasses}> Download AHK Script (.ahk) </button>
                    </Dropdown>
                    
                    <Dropdown buttonText="Reset / Clear" buttonClasses={`${baseButtonClasses} bg-red-600 text-white hover:bg-red-700`}>
                        <button onClick={onResetToDefaults} className={dropdownItemClasses}> Reset to Default Data </button>
                        <button onClick={onDeletePolls} className={dropdownItemClasses}> Delete Polls Only </button>
                        <div className="border-t my-1"></div>
                        <button onClick={onDeleteAll} className={`${dropdownItemClasses} text-red-700 hover:bg-red-50 font-semibold`}> Delete All Data </button>
                    </Dropdown>

                </div>
            </div>
        </header>
    );
};

export default Header;
