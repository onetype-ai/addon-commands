// This file is part of OneType. Created and led by Dejan Tomic <hi@iamdejan.com>, co-authored by Stefan Pakic, onetype.ai

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
