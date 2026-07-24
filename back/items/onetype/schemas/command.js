// This file is part of OneType. Created and led by Dejan Tomic <hi@iamdejan.com>, onetype.ai

onetype.schemas.ItemAdd({
    id: 'command',
    description: 'The command shape.',
    addon: 'commands',
    config: {
        id: {
            type: 'string',
            description: 'Unique command id.'
        },
        addon: {
            type: 'string',
            description: 'Name of the addon the command belongs to.'
        },
        exposed: {
            type: 'boolean',
            description: 'Whether the command is reachable over the HTTP API.'
        },
        description: {
            type: 'string',
            description: 'What the command does.'
        },
        method: {
            type: 'string',
            description: 'HTTP method when the command has an endpoint.'
        },
        endpoint: {
            type: 'string',
            description: 'HTTP endpoint the command answers on, null while the command is internal.'
        },
        type: {
            type: 'string',
            description: 'Response type the command resolves over HTTP.'
        },
        in: {
            type: 'object|string',
            description: 'Input schema of the command.'
        },
        out: {
            type: 'object|string',
            description: 'Output schema of the command.'
        }
    }
});
