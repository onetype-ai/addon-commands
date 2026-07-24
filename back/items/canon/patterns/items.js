// This file is part of OneType. Created and led by Dejan Tomic <hi@iamdejan.com>, co-authored by Stefan Pakic, onetype.ai

onetype.AddonReady('canon.patterns', (patterns) =>
{
    patterns.Item({
        id: 'commands.items',
        description: 'A command file wraps one commands.Item in AddonReady, the fields run in canon order, in, out and condition leave when empty.',
        match: '/items/commands/[^/]+\\.js$',
        claims: '/items/commands/',
        pattern: 'onetype.AddonReady(\'commands\', (commands) =>\n{\n    commands.Item({ __fields__ });\n});',
        fields: {
            id: {
                type: 'string',
                required: true,
                description: 'The command id, the addon then the action with colons.'
            },
            addon: {
                type: 'string',
                required: true,
                description: 'The addon the command belongs to, its owner.'
            },
            description: {
                type: 'string',
                required: true,
                description: 'What the command does, one sentence.'
            },
            exposed: {
                type: 'boolean',
                required: true,
                description: 'Whether the command answers over http.'
            },
            method: {
                type: 'string',
                description: 'The http method when the command has an endpoint.'
            },
            endpoint: {
                type: 'string',
                description: 'The http path the command answers on.'
            },
            type: {
                type: 'string',
                description: 'The response type, json, html, css or js.'
            },
            metadata: {
                type: 'object',
                description: 'Free tags for whoever wants them.'
            },
            silent: {
                type: 'boolean',
                description: 'Marks a composite command so telemetry logs it once.'
            },
            in: {
                type: 'object|string',
                description: 'The input schema, an object or a schema name, left out when none.'
            },
            out: {
                type: 'object|string',
                description: 'The output schema, an object or a schema name, left out when none.'
            },
            condition: {
                type: 'function',
                description: 'The guard, returns a string to block or nothing to pass, left out when open.'
            },
            callback: {
                type: 'function',
                required: true,
                description: 'The command body, ends in resolve with the data or an error.'
            }
        }
    });
});
