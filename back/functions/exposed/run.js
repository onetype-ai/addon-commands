import commands from '#commands/back/addon.js';

commands.FnExpose('run', async function(id, data = {})
{
    const command = commands.ItemGet(id);

    if(!command)
    {
        throw onetype.Error(404, 'Command :id: not found.', {id});
    }

    return await command.Fn('run', data);
});
