onetype.AddonReady('commands', (commands) =>
{
    commands.Item({
        id: 'commands:run',
        addon: 'commands',
        description: 'Runs an exposed command by id with the given properties and returns its result envelope.',
        exposed: true,
        method: 'POST',
        endpoint: '/api/commands/run',
        type: 'JSON',
        silent: true,
        in: {
            id: {
                type: 'string',
                required: true,
                description: 'Id of the command to run.'
            },
            data: {
                type: 'json',
                value: {},
                description: 'Properties passed to the command, validated against its input schema.'
            }
        },
        out: {
            data: {
                type: 'string|object|boolean|number|array',
                description: 'Data the command resolved with.'
            },
            message: {
                type: 'string',
                description: 'Human readable result message.'
            },
            code: {
                type: 'number',
                description: 'Status code of the result, HTTP style. 2xx is success.'
            }
        },
        callback: async function(properties, resolve)
        {
            const forward = async () =>
            {
                const command = commands.ItemGet(properties.id);

                if(!command)
                {
                    return resolve(null, 'Command does not exist.', 404);
                }

                if(!command.Get('exposed'))
                {
                    return resolve(null, 'Command is not exposed.', 403);
                }

                const result = await command.Fn('run', properties.data, this);

                resolve({
                    data: result.data,
                    message: result.message,
                    code: result.code
                });
            };

            try
            {
                await forward();
            }
            catch(error)
            {
                resolve(null, error.message, typeof error.code === 'number' ? error.code : 500);
            }
        }
    });
});
