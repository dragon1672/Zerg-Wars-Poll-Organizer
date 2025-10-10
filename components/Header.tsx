
import React from 'react';

interface HeaderProps {
    onAddPoll: () => void;
    onExport: () => void;
    onSaveProject: () => void;
    onTriggerLoad: () => void;
    onDeleteAll: () => void;
    onManageTemplates: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddPoll, onExport, onSaveProject, onTriggerLoad, onDeleteAll, onManageTemplates }) => {
    return (
        <header className="p-4 bg-white shadow-md mb-4 sticky top-0 z-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <h1 className="text-3xl font-extrabold text-indigo-700">Zerg Wars Poll Organizer</h1>
                <div className="flex flex-wrap gap-3 mt-4 md:mt-0 items-center">
                    <button onClick={onAddPoll} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition"> + Add Poll </button>
                    <button onClick={onManageTemplates} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:bg-purple-700 transition"> Manage Templates </button>
                    <button onClick={onSaveProject} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition"> Save Project </button>
                    <button onClick={onTriggerLoad} className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-xl shadow-lg hover:bg-teal-700 transition"> Load Project </button>
                    <button onClick={onExport} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:bg-green-700 transition"> Export Polls </button>
                    <button onClick={onDeleteAll} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-xl shadow-lg hover:bg-red-700 transition" title="Delete All Data"> Delete All </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
