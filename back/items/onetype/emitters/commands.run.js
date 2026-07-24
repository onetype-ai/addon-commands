onetype.emitters.ItemAdd({
    id: 'commands.run',
    addon: 'commands',
    description: 'Fired after every command execution, success or failure. Carries the full input and result of the run.',
    config: {
        id: {
            type: 'string',
            description: 'Id of the command that ran.'
        },
        input: {
            type: 'json',
            description: 'Input properties the command received, after validation.'
        },
        data: {
            type: 'any',
            description: 'Data the command resolved with. Null when the run failed.'
        },
        message: {
            type: 'string',
            description: 'Human readable result message.'
        },
        code: {
            type: 'number',
            description: 'Status code of the result, HTTP style. 2xx is success.'
        },
        time: {
            type: 'string',
            description: 'Execution duration in milliseconds.'
        },
        context: {
            type: 'json',
            description: 'Context the run carried, by reference. HTTP runs carry the request, response and state. Read during the emit, never hold it.'
        },
        direct: {
            type: 'boolean',
            description: 'Whether the run was direct, skipping the condition as a trusted internal call.'
        }
    }
});
