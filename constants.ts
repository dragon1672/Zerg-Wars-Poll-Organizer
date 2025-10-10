
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
    "poll_e0a3013a": {
      "description": "Experimental: The enemy Terran base in Coop mode now starts with a large base, but sends fewer reinforcements. Was this a good change?",
      "category": "GENERAL",
      "options": [
        { "id": "691a36ac", "text": "I support this change, keep it as-is" },
        { "id": "f5a3a00f", "text": "I support the direction, but it needs follow-up" },
        { "id": "73a0ad01", "text": "Neutral, I do not have a strong opinion" },
        { "id": "733a9c32", "text": "I do not support the direction, but maybe I would with more changes" },
        { "id": "9c97296e", "text": "I do not support the direction, revert this" }
      ], "order": 10, "id": "poll_e0a3013a"
    },
    "poll_3b6d1589": {
      "description": "Experimental: Do you think Standard 4v4 games are now longer than they used to be on average?",
      "category": "GENERAL",
      "options": [
        { "id": "cecdc4dc", "text": "Yes, games feel much longer" },
        { "id": "559ab2a2", "text": "Yes, games feel a bit longer" },
        { "id": "142ff072", "text": "Unsure, no noticeable difference" },
        { "id": "e507c45e", "text": "No, games feel shorter" }
      ], "order": 20, "id": "poll_3b6d1589"
    },
    "poll_3a168c59": {
      "description": "Experimental: AI Spawn Crawlers give less mineral bounty, but triggering the anti-camping event now drops minerals that are shared with your team when you pick them up. Was this a good change?",
      "category": "GENERAL",
      "options": [
        { "id": "5fdb8399", "text": "I support this change, keep it as-is" },
        { "id": "f2812cad", "text": "I support the direction, but it needs follow-up" },
        { "id": "fd0ad4b1", "text": "Neutral, I do not have a strong opinion" },
        { "id": "088f9953", "text": "I do not support the direction, but maybe I would with more changes" },
        { "id": "8c696df5", "text": "I do not support the direction, revert this" }
      ], "order": 30, "id": "poll_3a168c59"
    },
    "poll_97d012f4": {
      "description": "Experimental: Random events containing Nydus Worms and Omega Worms often fed good players minerals and/or lagged the game, so they were disabled. How do you feel about this change?",
      "category": "GENERAL",
      "options": [
        { "id": "2f50f274", "text": "I support this change, keep it as-is" },
        { "id": "97c3822f", "text": "Neutral, I do not have a strong opinion" },
        { "id": "646b756b", "text": "I do not support the direction, revert this" }
      ], "order": 40, "id": "poll_97d012f4"
    },
    "poll_2cf9267b": {
      "description": "Experimental: Upgrading the Terran base now grants only 0.5 armor to Devastation Turrets and the Planetary Fortress instead of 1 armor, but the mineral bounty of Devastation Turrets was reduced to 450 from 600. Was this a good change?",
      "category": "GENERAL",
      "options": [
        { "id": "607babe7", "text": "I support this change, keep it as-is" },
        { "id": "73f9792d", "text": "I support the direction, but it needs follow-up" },
        { "id": "aaf4f229", "text": "Neutral, I do not have a strong opinion" },
        { "id": "74c9020a", "text": "I do not support the direction, but maybe I would with more changes" },
        { "id": "f9fc1bcb", "text": "I do not support the direction, revert this" }
      ], "order": 60, "id": "poll_2cf9267b"
    },
    "poll_1e18bfe4": {
      "description": "Experimental: Mentis used to drop Dark Swarm clouds and would become very hard to kill. How do you feel about Mentis after their rework?",
      "category": "GENERAL",
      "options": [
        { "id": "7bb5cd2c", "text": "I am happy with their current state." },
        { "id": "faa9916a", "text": "I do not have a strong opinion." },
        { "id": "b2331ad7", "text": "I am not happy with their current state." }
      ], "order": 70, "id": "poll_1e18bfe4"
    },
    "poll_bbc09efe": {
      "description": "The cliffs in Standard 4v4 games were reworked to allow ground-based assaults from a ramp. Has this been a good change?",
      "category": "GENERAL",
      "options": [
        { "id": "79ddae99", "text": "I support this change, keep it as-is" },
        { "id": "edde8554", "text": "I support the direction, but it needs follow-up" },
        { "id": "77c965a7", "text": "Neutral, I do not have a strong opinion" },
        { "id": "4335f0dd", "text": "I do not support the direction, but maybe I would with more changes" },
        { "id": "da389236", "text": "I do not support the direction, revert this" }
      ], "order": 50, "id": "poll_bbc09efe"
    },
    "poll_c6d2532f": {
      "description": "Experimental: Units owned by players were changed to no longer be pushable by AI units, which was mostly an issue in Strike mode. Has this turned out okay?",
      "category": "GENERAL",
      "options": [
        { "id": "f551afac", "text": "It has not caused any significant problems with players manipulating pathing and should be kept." },
        { "id": "91141c6e", "text": "It has caused some significant problems with players manipulating pathing and should be reverted." }
      ], "order": 80, "id": "poll_c6d2532f"
    },
    "poll_f74ec951": {
      "description": "Experimental: Zerglings received a bit of an overhaul with the following changes:\n- Increased life of Zergling variants by 5\n- Increased movement speed of Zergling variants by 0.1\n- Increased size of Zerglings by 10%\n- Increased damage of Zergling variants by 2\n- Reduced armor shred from Shredding Claws debuff to 50% (30% for Heroic) from 75% (50% for Heroic)\n- Zerglings now are added to the recurring AI Swarm over a longer period of time\n- Reduced mineral bounty of Zerglings variants by 50% (67% for Swarmlings)\n- Increased the minerals generated and distributed to players by the Planetary Fortress\n\nHow did these changes turn out for the AI Swarm recurring and event Zerglings? (Zerg, Kerrigan, Mengsk will be addressed in separate polls.)",
      "category": "GENERAL",
      "options": [
        { "id": "06e4ca41", "text": "I am very happy with how these changes impacted the AI Swarm Zerglings." },
        { "id": "eb85bcab", "text": "Most of these changes were good." },
        { "id": "a204b6b7", "text": "I have very mixed feelings about these changes." },
        { "id": "2583a411", "text": "Most of these changes were bad." },
        { "id": "9081a282", "text": "I am very unhappy with how these changes impacted the AI Swarm Zerglings." }
      ], "order": 90, "id": "poll_f74ec951"
    },
    "poll_a626388a": {
      "description": "Experimental: Ultralisk variants were buffed on experimental to be more durable, making them better front line units for the AI Swarm in the late game.\n- Increased life of Ultralisk and strains to 650 from 500\n- Recurring AI Swarm Ultralisks now spawn later in the game, and in slightly fewer numbers\n\nHow did these changes turn out for the AI Swarm recurring and event Ultralisks? (Zerg, Kerrigan, Mengsk will be addressed in separate polls.)",
      "category": "GENERAL",
      "options": [
        { "id": "06e4ca41", "text": "I am happy with how these changes impacted the AI Swarm Ultralisks." },
        { "id": "9081a282", "text": "I am unhappy with how these changes impacted the AI Swarm Ultralisks." }
      ], "order": 110, "id": "poll_a626388a"
    },
    "poll_654c8444": {
      "description": "Experimental: Vote for the three strongest factions in Standard 4v4 map games:",
      "category": "GENERAL",
      "options": [
        { "id": "6c96ef13", "text": "Terran" }, { "id": "854b43df", "text": "Protoss" }, { "id": "5cd180dd", "text": "Zerg" },
        { "id": "eb65e53c", "text": "Tal'Darim" }, { "id": "dccd2c60", "text": "Mengsk" }, { "id": "6ac7443a", "text": "Kerrigan" },
        { "id": "78f9fb0a", "text": "Moebius" }, { "id": "d7749733", "text": "Nova" }, { "id": "27e046cf", "text": "Tychus" },
        { "id": "5812b192", "text": "Stukov" }
      ], "order": 120, "id": "poll_654c8444"
    },
    "poll_f2ab3a58": {
      "description": "Experimental: Vote for the three strongest factions in Strike map games:",
      "category": "GENERAL",
      "options": [
        { "id": "6c96ef13", "text": "Terran" }, { "id": "854b43df", "text": "Protoss" }, { "id": "5cd180dd", "text": "Zerg" },
        { "id": "eb65e53c", "text": "Tal'Darim" }, { "id": "dccd2c60", "text": "Mengsk" }, { "id": "6ac7443a", "text": "Kerrigan" },
        { "id": "78f9fb0a", "text": "Moebius" }, { "id": "d7749733", "text": "Nova" }, { "id": "27e046cf", "text": "Tychus" },
        { "id": "5812b192", "text": "Stukov" }
      ], "order": 130, "id": "poll_f2ab3a58"
    },
    "poll_734bbcd2": {
      "description": "Experimental: Vote for the three weakest factions in Standard 4v4 map games:",
      "category": "GENERAL",
      "options": [
        { "id": "6c96ef13", "text": "Terran" }, { "id": "854b43df", "text": "Protoss" }, { "id": "5cd180dd", "text": "Zerg" },
        { "id": "eb65e53c", "text": "Tal'Darim" }, { "id": "dccd2c60", "text": "Mengsk" }, { "id": "6ac7443a", "text": "Kerrigan" },
        { "id": "78f9fb0a", "text": "Moebius" }, { "id": "d7749733", "text": "Nova" }, { "id": "27e046cf", "text": "Tychus" },
        { "id": "5812b192", "text": "Stukov" }
      ], "order": 140, "id": "poll_734bbcd2"
    },
    "poll_b7772e78": {
      "description": "Experimental: Vote for the three weakest factions in Strike map games:",
      "category": "GENERAL",
      "options": [
        { "id": "6c96ef13", "text": "Terran" }, { "id": "854b43df", "text": "Protoss" }, { "id": "5cd180dd", "text": "Zerg" },
        { "id": "eb65e53c", "text": "Tal'Darim" }, { "id": "dccd2c60", "text": "Mengsk" }, { "id": "6ac7443a", "text": "Kerrigan" },
        { "id": "78f9fb0a", "text": "Moebius" }, { "id": "d7749733", "text": "Nova" }, { "id": "27e046cf", "text": "Tychus" },
        { "id": "5812b192", "text": "Stukov" }
      ], "order": 150, "id": "poll_b7772e78"
    },
    "poll_dd8ec934": {
      "description": "Experimental: \n- Reduced Fire Suppression healing for structures to 7 per second from 9 for Terran, Mengsk, Nova, Tychus",
      "category": "UNSORTED",
      "options": [
        { "id": "23e4dc4f", "text": "I support this change, keep it as-is" },
        { "id": "ffaf0a86", "text": "Neutral, I do not have a strong opinion" },
        { "id": "449c186e", "text": "I do not support this change, revert this" }
      ], "order": 10, "id": "poll_dd8ec934"
    },
    "poll_3df6d0df": {
      "description": "Experimental: The following changes were made to try to limit the impact of energy draining effects on heroes, which should allow us to move forward with nerfs to heroes as needed to create less polarizing gameplay — notably scenarios where the heroes do too much if not drained and too little if drained.\n- Reduced energy drain from Terran Elite Ghost upgrade to +10% targets maximum energy from +25% target’s maximum energy \n- Increased cast range of Protoss High Templar’s Feedback ability to 11 from 10\n- Increased energy cost of Protoss High Templar’s Feedback ability to 75 from 50\n- Protoss High Templar’s Feedback now drains at most 200 energy instead of 100%\n- Tal'darim War Prism's Feedback now drains at most 200 energy instead of 100%\n- Emperor’s Shadow EMP Blast now drains at most 200 energy instead of 100%\n- Reduced energy drain of Spec Ops Ghost EMP to 125 (+25% target’s maximum energy) from 150 (+50% target’s maximum energy)\n\nDo you think that these changes have been overall better for the game?",
      "category": "UNSORTED",
      "options": [
        { "id": "7548d3ca", "text": "1. Overall this has made the game better and I do not think we need to go and nerf heroes at this time" },
        { "id": "fe5f024f", "text": "2. Overall this has been a good set of changes, but we need to visit heroes like Kerrigan to evaluate further" },
        { "id": "8f05b7bd", "text": "3. Neutral, no strong opinion" },
        { "id": "cba80ddb", "text": "4. I do not like the direction these changes have taken the game and I would rather see these changes reverted than see further changes in this direction" }
      ], "order": 20, "id": "poll_3df6d0df"
    },
    "poll_87e6656a": {
      "description": "Experimental: Tychus Vega, Zerg Infestor, and the new Protoss Dark Archon units had their mind control abilities converted to a system where they deal damage over time and control the unit if it below a low life threshold. What do you think of this overall?",
      "category": "UNSORTED",
      "options": [
        { "id": "9ddcf243", "text": "The concept is really good and fixes most or all of my complaints with mind control abilities" },
        { "id": "a2c1b5b1", "text": "The concept is good, it fixes some issues, but it is still a bit problematic" },
        { "id": "45dee509", "text": "It is hard to tell because the balance is still pretty messed up" },
        { "id": "5af5bdff", "text": "I am neutral on this change, equal good and bad" },
        { "id": "c1274058", "text": "I think this concept sucks and should be reverted to the old instant mind control style" },
        { "id": "ce6811df", "text": "This concept is about as good as it gets, but I still dislike mind control and would just remove mind control abilities from the game" }
      ], "order": 30, "id": "poll_87e6656a"
    },
    "poll_6c84f269": { "description": "Experimental: Terran basic Drop Pod basic drop pod Sabotage ability in Standard 4v4 games is:", "category": "TERRAN", "options": [ { "id": "b0113bd1", "text": "Overpowered" }, { "id": "e273156c", "text": "Stronger than balanced" }, { "id": "f2a44134", "text": "Balanced" }, { "id": "ef0888aa", "text": "Weaker than balanced" }, { "id": "bed6930e", "text": "Underpowered" } ], "order": 10, "id": "poll_6c84f269" },
    "poll_9230cfb4": { "description": "Experimental: Terran basic Drop Pod basic drop pod Sabotage ability in Strike games is:", "category": "TERRAN", "options": [ { "id": "b0113bd1", "text": "Overpowered" }, { "id": "e273156c", "text": "Stronger than balanced" }, { "id": "f2a44134", "text": "Balanced" }, { "id": "ef0888aa", "text": "Weaker than balanced" }, { "id": "bed6930e", "text": "Underpowered" } ], "order": 30, "id": "poll_9230cfb4" },
    "poll_66248bb8": { "description": "Experimental: The Terran Bunker in Standard 4v4 games is:", "category": "TERRAN", "options": [ { "id": "e3ef17e0", "text": "Overpowered" }, { "id": "a757adac", "text": "Stronger than balanced" }, { "id": "fdaa1b0b", "text": "Balanced" }, { "id": "442ef5fb", "text": "Weaker than balanced" }, { "id": "4daa5607", "text": "Underpowered" } ], "order": 41, "id": "poll_66248bb8" },
    "poll_b7bf3e9c": { "description": "Experimental: The Terran Bunker in Strike games is:", "category": "TERRAN", "options": [ { "id": "e3ef17e0", "text": "Overpowered" }, { "id": "a757adac", "text": "Stronger than balanced" }, { "id": "fdaa1b0b", "text": "Balanced" }, { "id": "442ef5fb", "text": "Weaker than balanced" }, { "id": "4daa5607", "text": "Underpowered" } ], "order": 50, "id": "poll_b7bf3e9c" },
    "poll_0d4d6872": { "description": "Experimental: Protoss T4 armor/weapon upgrades were removed. Was this a good change?", "category": "PROTOSS", "options": [ { "id": "7f77fdd8", "text": "I support this change, keep it as-is" }, { "id": "46389a01", "text": "I support the direction, but it needs follow-up" }, { "id": "b7ff3586", "text": "Neutral, I do not have a strong opinion" }, { "id": "af7b5cbb", "text": "I do not support the direction, but maybe I would with more changes" }, { "id": "1f9d4758", "text": "I do not support the direction, revert this" } ], "order": 10, "id": "poll_0d4d6872" },
    "poll_02b5388e": { "description": "Experimental: The Protoss Sentry in Standard 4v4 games is:", "category": "PROTOSS", "options": [ { "id": "e3ef17e0", "text": "Overpowered" }, { "id": "a757adac", "text": "Stronger than balanced" }, { "id": "fdaa1b0b", "text": "Balanced" }, { "id": "442ef5fb", "text": "Weaker than balanced" }, { "id": "4daa5607", "text": "Underpowered" } ], "order": 20, "id": "poll_02b5388e" },
    "poll_02c5aaac": { "description": "Experimental: The Protoss Sentry in Strike games is:", "category": "PROTOSS", "options": [ { "id": "e3ef17e0", "text": "Overpowered" }, { "id": "a757adac", "text": "Stronger than balanced" }, { "id": "fdaa1b0b", "text": "Balanced" }, { "id": "442ef5fb", "text": "Weaker than balanced" }, { "id": "4daa5607", "text": "Underpowered" } ], "order": 30, "id": "poll_02c5aaac" },
    "poll_f8ec53fc": { "description": "Experimental: The Protoss Dark Archon in Standard 4v4 games is:", "category": "PROTOSS", "options": [ { "id": "e3ef17e0", "text": "Overpowered" }, { "id": "a757adac", "text": "Stronger than balanced" }, { "id": "fdaa1b0b", "text": "Balanced" }, { "id": "442ef5fb", "text": "Weaker than balanced" }, { "id": "4daa5607", "text": "Underpowered" } ], "order": 40, "id": "poll_f8ec53fc" },
    "poll_4f0e9b98": { "description": "Experimental: The Protoss Dark Archon in Strike games is:", "category": "PROTOSS", "options": [ { "id": "e3ef17e0", "text": "Overpowered" }, { "id": "a757adac", "text": "Stronger than balanced" }, { "id": "fdaa1b0b", "text": "Balanced" }, { "id": "442ef5fb", "text": "Weaker than balanced" }, { "id": "4daa5607", "text": "Underpowered" } ], "order": 50, "id": "poll_4f0e9b98" },
    "poll_805f96e1": { "description": "Experimental: The Protoss Colossus in Standard 4v4 games is:", "category": "PROTOSS", "options": [ { "id": "e3ef17e0", "text": "Overpowered" }, { "id": "a757adac", "text": "Stronger than balanced" }, { "id": "fdaa1b0b", "text": "Balanced" }, { "id": "442ef5fb", "text": "Weaker than balanced" }, { "id": "4daa5607", "text": "Underpowered" } ], "order": 60, "id": "poll_805f96e1" },
    "poll_1476076e": { "description": "Experimental: The Protoss Colossus in Strike games is:", "category": "PROTOSS", "options": [ { "id": "e3ef17e0", "text": "Overpowered" }, { "id": "a757adac", "text": "Stronger than balanced" }, { "id": "fdaa1b0b", "text": "Balanced" }, { "id": "442ef5fb", "text": "Weaker than balanced" }, { "id": "4daa5607", "text": "Underpowered" } ], "order": 70, "id": "poll_1476076e" }
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
