import commands from '#commands/back/addon.js';

commands.Fn('item.run', function(item, properties = {}, context = {}, options = {})
{
    const { direct = false, onChunk = null } = options;
    const startTime = performance.now();

    return new Promise(async (resolve, reject) =>
    {
        const emit = (result) =>
        {
            onetype.emitters.fire('commands.run', {
                id: item.Get('id'),
                input: properties,
                data: result.data,
                message: result.message,
                code: result.code,
                time: result.time,
                context,
                direct
            });
        };

        const finish = (message, code, data = null) =>
        {
            const result = {
                data,
                message,
                code,
                time: (performance.now() - startTime).toFixed(2),
                end: true
            };

            emit(result);
            resolve(result);
        };

        const parse = () =>
        {
            try
            {
                properties = item.Get('in') ? onetype.DataDefine(properties, onetype.DataConfig(item.Get('in')), true) : {};

                return true;
            }
            catch(error)
            {
                finish('Command ' + item.Get('id') + ' invalid input: ' + error.message, 400, error.message);

                return false;
            }
        };

        const allow = async () =>
        {
            if(direct || !item.Get('condition'))
            {
                return true;
            }

            const allowed = await item.Get('condition').call(context, properties);

            if(typeof allowed === 'string')
            {
                finish(allowed, 403);

                return false;
            }

            return true;
        };

        const shape = (data) =>
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
        };

        let settled = false;

        const callback = (data, message = "Command '{{command}}' executed successfully.", code = 200, end = true) =>
        {
            if(settled)
            {
                return;
            }

            if(message === null && code === 404)
            {
                message = 'The requested resource cannot be found.';
            }

            if(code >= 200 && code < 300 && item.Get('out'))
            {
                data = shape(data);
            }

            const result = {
                data,
                message: message?.replace('{{command}}', item.Get('id')),
                code,
                time: (performance.now() - startTime).toFixed(2),
                end
            };

            if(onChunk && !result.end)
            {
                onChunk(result);
            }

            if(result.end)
            {
                settled = true;
                emit(result);
                resolve(result);
            }
        };

        try
        {
            if(!parse())
            {
                return;
            }

            const middleware = await onetype.middlewares.run('commands.run', {
                id: item.Get('id'),
                properties,
                cancel: false
            });

            if(middleware.value.cancel)
            {
                return finish('Command ' + item.Get('id') + ' was cancelled.', 409);
            }

            if(!await allow())
            {
                return;
            }

            await item.Get('callback').call(context, properties, callback, direct);
        }
        catch(error)
        {
            emit({
                data: null,
                message: error.message || String(error),
                code: typeof error.code === 'number' ? error.code : 500,
                time: (performance.now() - startTime).toFixed(2)
            });

            reject(error);
        }
    })
});
