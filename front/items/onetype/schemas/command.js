// This file is part of OneType. Created and led by Dejan Tomic <hi@iamdejan.com>, co-authored by Stefan Pakic, onetype.ai

onetype.AddonReady('onetype.schemas', function(schemas)
{
    schemas.ItemAdd({
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
});
