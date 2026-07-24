onetype.AddonReady('commands', (commands) =>
{
    commands.Item({
        id: 'commands:get:many',
        addon: 'commands',
        description: 'Lists every exposed command with its schemas and HTTP surface.',
        exposed: true,
        method: 'GET',
        endpoint: '/api/commands',
        type: 'JSON',
        silent: true,
        out: {
            commands: {
                type: 'array',
                each: {
                    type: 'object',
                    config: 'command',
                    description: 'One exposed command with its schemas and HTTP surface.'
                },
                description: 'The exposed commands.'
            }
        },
        callback: async function(properties, resolve)
        {
            const list = Object.values(commands.Items())
                .filter((item) => item.Get('exposed'))
                .map((item) => item.Get(['id', 'exposed', 'description', 'method', 'endpoint', 'type', 'in', 'out']));

            resolve({ commands: list });
        }
    });
});
