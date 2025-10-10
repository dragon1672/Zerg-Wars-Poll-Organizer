
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
    'poll_coop_mode': {
        id: 'poll_coop_mode', category: 'GENERAL',
        description: 'Coop mode was changed such that the enemy Terran base now starts the game with a large Covert Ops base, but replaces fewer things and sends fewer reinforcements to push the AI Spawn. Was this a good change? (Standard 4v4)',
        options: [ { id: 'opt1', text: 'I support this change, keep it' }, { id: 'opt2', text: 'Neutral, I have no strong opinion' }, { id: 'opt3', text: 'I do not support this change, revert it' } ],
        order: 10,
    },
    'poll_zerg_drone_income': {
        id: 'poll_zerg_drone_income', category: 'ZERG',
        description: 'Zerg faction base gas income was reduced to 30 from 40 per 18 seconds, but Drones can now morph into automated extractors for 4 gas per 15 seconds income. Was this a good change? (Standard 4v4)',
        options: [ { id: 'optA', text: 'Yes, I like the change, keep it.' }, { id: 'optB', text: 'Neutral, I have no strong opinion' }, { id: 'optC', text: 'No, I dislike the change, revert it.' } ],
        order: 20,
    },
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
