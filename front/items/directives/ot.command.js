onetype.AddonReady('directives', function(directives)
{
    directives.ItemAdd({
        id: 'ot-command',
        icon: 'terminal',
        name: 'Command',
        description: 'Execute a command instantly on render',
        category: 'data',
        trigger: 'node',
        order: 664,
        strict: true,
        tag: 'ot-command',
        attributes: {
            'command': {
                type: 'string',
                required: true,
                description: 'Id of the command to run on render.'
            },
            'bind': {
                type: 'string',
                value: 'command',
                description: 'Key the run state binds to on the compile data.'
            },
            '_success': {
                type: 'function',
                description: 'Called with the state when the run resolves 2xx.'
            },
            '_error': {
                type: 'function',
                description: 'Called with the state when the run fails or resolves outside 2xx.'
            },
            'data': {
                type: 'json',
                value: {},
                description: 'Properties passed to the command.'
            },
            'api': {
                type: 'boolean',
                value: false,
                description: 'Runs the command on the server through run.api when true.'
            }
        },
        code: function(data, item, compile, node)
        {
            if(node.tagName.toLowerCase() !== 'ot-command')
            {
                return;
            }

            const config = {};
            const methods = {};

            methods.init = () =>
            {
                methods.config();

                if(compile.data[config.bind] !== undefined)
                {
                    return;
                }

                compile.data[config.bind] = null;
                methods.run();
            };

            methods.config = () =>
            {
                config.command = data['command'].value;
                config.bind = data['bind'].value;
                config.onSuccess = data['_success'].value;
                config.onError = data['_error'].value;
                config.data = data['data'].value;
                config.api = data['api'].value;
            };

            methods.run = async () =>
            {
                const state = {
                    response: null,
                    error: null,
                    loading: true
                };

                try
                {
                    const result = config.api
                        ? await commands.run.api(config.command, config.data)
                        : await commands.run(config.command, config.data);

                    if(result.code < 200 || result.code >= 300)
                    {
                        state.response = result;
                        state.error    = result.message;
                        state.loading  = false;

                        config.onError && config.onError(state);

                        return;
                    }

                    state.response = result;
                    state.error    = null;
                    state.loading  = false;

                    config.onSuccess && config.onSuccess(state);
                }
                catch(error)
                {
                    state.response = null;
                    state.error    = error.message;
                    state.loading  = false;

                    config.onError && config.onError(state);
                }
                finally
                {
                    compile.data[config.bind] = state;
                    compile.data.Update();
                }
            };

            methods.init();
        }
    });
});
