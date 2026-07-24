// This file is part of OneType. Created and led by Dejan Tomic <hi@iamdejan.com>, co-authored by Stefan Pakic, onetype.ai

import commands from '#commands/back/addon.js';

commands.Fn('item.run', function(item, properties = {}, context = {}, options = {})
{
    const { direct = false, onChunk = null } = options;
    const startTime = performance.now();

    this.envelope = (data, message, code, end) =>
    {
        const time = (performance.now() - startTime).toFixed(2);

        return { data, message, code, time, end };
    };

    this.emit = (result) =>
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

    return new Promise(async (resolve, reject) =>
    {
        let settled = false;

        this.finish = (message, code, data = null) =>
        {
            const result = this.envelope(data, message, code, true);

            this.emit(result);
            resolve(result);
        };

        this.parse = () =>
        {
            try
            {
                properties = item.Get('in') ? onetype.DataDefine(properties, onetype.DataConfig(item.Get('in')), true) : {};

                return true;
            }
            catch(error)
            {
                this.finish('Command ' + item.Get('id') + ' invalid input: ' + error.message, 400, error.message);

                return false;
            }
        };

        this.allow = async () =>
        {
            if(direct || !item.Get('condition'))
            {
                return true;
            }

            const allowed = await item.Get('condition').call(context, properties);

            if(typeof allowed === 'string')
            {
                this.finish(allowed, 403);

                return false;
            }

            return true;
        };

        this.deliver = (result) =>
        {
            if(onChunk && !result.end)
            {
                onChunk(result);
            }

            if(result.end)
            {
                settled = true;
                this.emit(result);
                resolve(result);
            }
        };

        this.wording = (message, code) =>
        {
            if(message === null && code === 404)
            {
                return 'The requested resource cannot be found.';
            }

            if(message === null || message === undefined)
            {
                return '';
            }

            return message.replace('{{command}}', item.Get('id'));
        };

        this.callback = (data, message = "Command '{{command}}' executed successfully.", code = 200, end = true) =>
        {
            if(settled)
            {
                return;
            }

            if(code >= 200 && code < 300 && item.Get('out'))
            {
                data = item.Fn('shape', data);
            }

            this.deliver(this.envelope(data, this.wording(message, code), code, end));
        };

        this.execute = async () =>
        {
            if(!this.parse())
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
                return this.finish('Command ' + item.Get('id') + ' was cancelled.', 409);
            }

            if(!await this.allow())
            {
                return;
            }

            await item.Get('callback').call(context, properties, this.callback, direct);
        };

        try
        {
            await this.execute();
        }
        catch(error)
        {
            this.emit(this.envelope(null, error.message ? error.message : String(error), typeof error.code === 'number' ? error.code : 500, true));
            reject(error);
        }
    });
});
