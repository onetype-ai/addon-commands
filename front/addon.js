// This file is part of OneType. Created and led by Dejan Tomic <hi@iamdejan.com>, onetype.ai

const commands = onetype.Addon('commands', (addon) =>
{
    addon.Field('id', {
        type: 'string',
        required: true,
        description: 'Unique command id, addon then action with colon separators, like vault:set.'
    });

    addon.Field('addon', {
        type: 'string',
        description: 'Name of the addon the command belongs to.'
    });

    addon.Field('type', {
        type: 'string',
        value: 'JSON',
        options: ['JSON', 'HTML', 'CSS', 'JS'],
        description: 'Response type the command resolves over HTTP.'
    });

    addon.Field('description', {
        type: 'string',
        description: 'What the command does, written as a full sentence.'
    });

    addon.Field('metadata', {
        type: 'json',
        value: {},
        description: 'Free tags for whoever wants them.'
    });

    addon.Field('in', {
        type: 'object|string',
        description: 'Input schema the properties are validated against, an object config or a schema name.'
    });

    addon.Field('out', {
        type: 'object|string',
        description: 'Output schema the resolved data is validated against, an object config or a schema name.'
    });

    addon.Field('exposed', {
        type: 'boolean',
        value: false,
        description: 'Whether the command is reachable over the HTTP API.'
    });

    addon.Field('silent', {
        type: 'boolean',
        value: false,
        description: 'Marks composite commands so telemetry consumers like the terminal skip logging them twice.'
    });

    addon.Field('condition', {
        type: 'function',
        description: 'Guard called with the run context as this before the callback. Returning a string blocks the run with that message.'
    });

    addon.Field('callback', {
        type: 'function',
        description: 'The command body, called with the validated properties and a resolve callback.'
    });
});
