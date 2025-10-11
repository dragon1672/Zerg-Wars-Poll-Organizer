
import React from 'react';

interface ConfirmDeleteModalProps {
    onConfirm: () => void;
    onClose: () => void;
    title: string;
    message: string;
    confirmText: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onConfirm, onClose, title, message, confirmText }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-11/12 max-w-sm">
                <h2 className="text-xl font-bold text-red-700 mb-3">{title}</h2>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition"> Cancel </button>
                    <button type="button" onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-md transition"> {confirmText} </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
