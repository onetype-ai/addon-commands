commands.Fn('item.run', function(item, properties = {}, context = {}, options = {})
{
    const { onChunk = null } = options;
    const startTime = performance.now();

    this.envelope = (data, message, code, end) => ({
        data,
        message,
        code,
        time: (performance.now() - startTime).toFixed(2),
        end
    });

    this.emit = (result) =>
    {
        onetype.emitters.fire('commands.run', {
            id: item.Get('id'),
            input: properties,
            data: result.data,
            message: result.message,
            code: result.code,
            time: result.time
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
            if(!item.Get('condition'))
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

        this.callback = (data, message = "Command '{{command}}' executed successfully.", code = 200, end = true) =>
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
                data = item.Fn('shape', data);
            }

            this.deliver(this.envelope(data, message?.replace('{{command}}', item.Get('id')), code, end));
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

            await item.Get('callback').call(context, properties, this.callback);
        };

        try
        {
            await this.execute();
        }
        catch(error)
        {
            const reason = error.message ? error.message : String(error);

            this.emit(this.envelope(null, reason, 500, true));
            reject(error);
        }
    });
});
