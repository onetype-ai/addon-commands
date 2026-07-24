// This file is part of OneType. Created and led by Dejan Tomic <hi@iamdejan.com>, onetype.ai

import commands from '#commands/back/addon.js';

commands.Fn('item.shape', function(item, data)
{
    try
    {
        return onetype.DataDefine(data, onetype.DataConfig(item.Get('out')), true);
    }
    catch(error)
    {
        throw onetype.Error(500, 'Command :command: OUT error: :reason:', {
            command: item.Get('id'),
            reason: error.message
        });
    }
});
