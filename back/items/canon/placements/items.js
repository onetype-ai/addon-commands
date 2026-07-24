// This file is part of OneType. Created and led by Dejan Tomic <hi@iamdejan.com>, co-authored by Stefan Pakic, onetype.ai

onetype.AddonReady('canon.placements', (placements) =>
{
    placements.Item({
        id: 'commands.items',
        method: 'Item',
        receiver: 'commands',
        home: '/items/commands/',
        description: 'A command is an entry point, it stands alone in items commands.'
    });
});
