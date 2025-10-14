

import type { Category, Polls, Template } from './types';

export const STORAGE_KEY = 'zergWarsPollsData';
export const TEMPLATE_STORAGE_KEY = 'zergWarsTemplatesData';
export const COLLAPSE_KEY = 'pollOrganizerCollapseState';

export const columnCategories: Category[] = [
    { id: 'GENERAL', title: 'General', color: 'bg-red-100/70', border: 'border-red-500' },
    { id: 'PROTOSS', title: 'Protoss', color: 'bg-indigo-100/70', border: 'border-indigo-500' },
    { id: 'TERRAN', title: 'Terran', color: 'bg-blue-100/70', border: 'border-blue-500' },
    { id: 'ZERG', title: 'Zerg', color: 'bg-green-100/70', border: 'border-green-500' },
    { id: 'TALDARIM', title: "Tal'Darim", color: 'bg-purple-100/70', border: 'border-purple-500' },
    { id: 'MENGSEK', title: 'Mengsk', color: 'bg-yellow-100/70', border: 'border-yellow-500' },
    { id: 'KERRIGAN', title: 'Kerrigan', color: 'bg-pink-100/70', border: 'border-pink-500' },
    { id: 'MOEBIUS', title: 'Moebius', color: 'bg-cyan-100/70', border: 'border-cyan-500' },
    { id: 'NOVA', title: 'Nova', color: 'bg-orange-100/70', border: 'border-orange-500' },
    { id: 'TYCHUS', title: 'Tychus', color: 'bg-lime-100/70', border: 'border-lime-500' },
    { id: 'STUKOV', title: 'Stukov', color: 'bg-emerald-100/70', border: 'border-emerald-500' },
    { id: 'UNSORTED', title: 'Unsorted Bin', color: 'bg-gray-300/70', border: 'border-gray-700' },
];

export const categoryOrderMap = new Map(columnCategories.map((col, index) => [col.id, index]));

export const basePollsData: Polls = {
    "poll_zerg_aberration": {
      "id": "poll_zerg_aberration",
      "description": "How functional would the Zerg faction be if Aberration was removed and made exclusive to Stukov?",
      "category": "ZERG",
      "options": [
        { "id": "opt_za_1", "text": "This would be fine – I don't see any real issues with removing it." },
        { "id": "opt_za_2", "text": "The faction would be fine, but I'd be sad – It's not necessary, but I'd miss it." },
        { "id": "opt_za_3", "text": "Some buffs would be needed – Zerg would still work, but you'd need to tweak a few things to compensate." },
        { "id": "opt_za_4", "text": "This would be a significant issue – Removing Aberration would hurt the faction in a big way and be hard to fix." },
        { "id": "opt_za_5", "text": "Aberration is core to Zerg – It's too central to remove and would be an unfair nerf." }
      ],
      "order": 10,
      "tags": []
    },
    "poll_general_4v4": {
        "id": "poll_general_4v4",
        "description": "Do you think Standard 4v4 games are now longer than they used to be on average?",
        "category": "GENERAL",
        "options": [
            { "id": "cecdc4dc", "text": "Yes, games feel much longer" },
            { "id": "559ab2a2", "text": "Yes, games feel a bit longer" },
            { "id": "142ff072", "text": "Unsure, no noticeable difference" },
            { "id": "e507c45e", "text": "No, games feel shorter" }
        ],
        "order": 20,
        "tags": []
    },
    "poll_terran_bunker": {
        "id": "poll_terran_bunker",
        "description": "The Terran Bunker in Standard 4v4 games is:",
        "category": "TERRAN",
        "options": [
            { "id": "e3ef17e0", "text": "Overpowered" },
            { "id": "a757adac", "text": "Stronger than balanced" },
            { "id": "fdaa1b0b", "text": "Balanced" },
            { "id": "442ef5fb", "text": "Weaker than balanced" },
            { "id": "4daa5607", "text": "Underpowered" }
        ],
        "order": 10,
        "tags": ["balance"]
    }
};

export const baseTemplatesData: Template[] = [
    { 
        id: 'template_design_3', 
        name: 'Design (3)', 
        options: [
            { text: 'A good change, keep it and balance around it' }, 
            { text: 'Neutral, I do not have a strong opinion' }, 
            { text: 'A bad change, revert this' }
        ]
    },
    { 
        id: 'template_balance_5', 
        name: 'Balance (5)', 
        options: [
            { text: 'Overpowered' }, 
            { text: 'Stronger than balanced' }, 
            { text: 'Balanced' }, 
            { text: 'Weaker than balanced' }, 
            { text: 'Underpowered' }
        ]
    }
];
