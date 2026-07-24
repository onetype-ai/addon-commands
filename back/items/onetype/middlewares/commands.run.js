// This file is part of OneType. Created and led by Dejan Tomic <hi@iamdejan.com>, onetype.ai

onetype.middlewares.ItemAdd({
    id: 'commands.run',
    description: 'Runs before every command callback, after input validation. Intercepts may inspect the properties and cancel the run.',
    config: {
        id: {
            type: 'string',
            description: 'Id of the command about to run.'
        },
        properties: {
            type: 'json',
            description: 'Validated input properties of the run.'
        },
        cancel: {
            type: 'boolean',
            description: 'Set to true by an intercept to block the run.'
        }
    }
});
