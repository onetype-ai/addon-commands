// This file is part of OneType. Created and led by Dejan Tomic <hi@iamdejan.com>, co-authored by Stefan Pakic, onetype.ai

import commands from '#commands/back/addon.js';

commands.FnExpose('run', async function(id, data = {})
{
    const command = commands.ItemGet(id);

    if(!command)
    {
        throw onetype.Error(404, 'Command :id: not found.', {id});
    }

    return await command.Fn('run', data);
}, 'Runs a registered command and answers the envelope it resolved with.');
