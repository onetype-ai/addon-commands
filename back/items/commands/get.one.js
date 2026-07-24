// This file is part of OneType. Created and led by Dejan Tomic <hi@iamdejan.com>, onetype.ai

onetype.AddonReady('commands', (commands) =>
{
    commands.Item({
        id: 'commands:get:one',
        addon: 'commands',
        description: 'Returns one exposed command with its schemas and HTTP surface.',
        exposed: true,
        method: 'GET',
        endpoint: '/api/commands/:id',
        type: 'JSON',
        silent: true,
        in: {
            id: {
                type: 'string',
                required: true,
                description: 'Id of the command to describe.'
            }
        },
        out: {
            command: {
                type: 'object',
                config: 'command',
                description: 'The described command.'
            }
        },
        callback: async function(properties, resolve)
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

            resolve({
                command: command.Get(['id', 'exposed', 'description', 'method', 'endpoint', 'type', 'in', 'out'])
            });
        }
    });
});
