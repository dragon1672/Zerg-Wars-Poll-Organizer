import React, { useState, useEffect, useRef } from 'react';

interface HeaderProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
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
                <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-30">
                    <div className="py-1" role="menu" aria-orientation="vertical" onClick={() => setIsOpen(false)}>
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ 
    theme, setTheme, onAddPoll, onExport, onDownloadAhkScript, onSaveProject, onTriggerLoad, 
    onResetToDefaults, onDeletePolls, onDeleteAll, onManageTemplates
}) => {
    
    const baseButtonClasses = "px-4 py-2 font-semibold rounded-xl shadow-lg transition flex items-center justify-center";
    const dropdownItemClasses = "block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600";
    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    return (
        <header className="p-4 bg-white dark:bg-gray-800 shadow-md mb-4 sticky top-0 z-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <h1 className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-400">Zerg Wars Poll Organizer</h1>
                <div className="flex flex-wrap gap-3 mt-4 md:mt-0 items-center">
                    <button onClick={onAddPoll} className={`${baseButtonClasses} bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800`}> + Add Poll </button>
                    <button onClick={onManageTemplates} className={`${baseButtonClasses} bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800`}> Manage Templates </button>

                    <Dropdown buttonText="Project" buttonClasses={`${baseButtonClasses} bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800`}>
                         <button onClick={onSaveProject} className={dropdownItemClasses}> Save Project (.json) </button>
                         <button onClick={onTriggerLoad} className={dropdownItemClasses}> Load Project (.json) </button>
                    </Dropdown>
                    
                     <Dropdown buttonText="Export" buttonClasses={`${baseButtonClasses} bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800`}>
                        <button onClick={() => onExport('text')} className={dropdownItemClasses}> Export as Text (.txt) </button>
                        <button onClick={() => onExport('ahk')} className={dropdownItemClasses}> Export for AutoHotKey (.txt) </button>
                        <div className="border-t my-1 border-gray-200 dark:border-gray-600"></div>
                        <button onClick={onDownloadAhkScript} className={dropdownItemClasses}> Download AHK Script (.ahk) </button>
                    </Dropdown>
                    
                    <Dropdown buttonText="Reset / Clear" buttonClasses={`${baseButtonClasses} bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800`}>
                        <button onClick={onResetToDefaults} className={dropdownItemClasses}> Reset to Default Data </button>
                        <button onClick={onDeletePolls} className={dropdownItemClasses}> Delete Polls Only </button>
                        <div className="border-t my-1 border-gray-200 dark:border-gray-600"></div>
                        <button onClick={onDeleteAll} className={`${dropdownItemClasses} text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 font-semibold`}> Delete All Data </button>
                    </Dropdown>
                    
                    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-inner" title="Toggle Theme">
                         {theme === 'light' ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                         ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                         )}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;