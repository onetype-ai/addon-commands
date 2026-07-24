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
        strict: false,
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

            this.config = () =>
            {
                return {
                    command: data['command'].value,
                    bind: data['bind'].value,
                    data: data['data'].value,
                    api: data['api'].value,
                    onSuccess: data['_success'].value,
                    onError: data['_error'].value
                };
            };

            this.landed = (config, state, result) =>
            {
                state.response = result;
                state.loading = false;

                if(result.code < 200 || result.code >= 300)
                {
                    state.error = result.message;
                    config.onError && config.onError(state);

                    return;
                }

                state.error = null;
                config.onSuccess && config.onSuccess(state);
            };

            this.failed = (config, state, error) =>
            {
                state.response = null;
                state.error = error.message;
                state.loading = false;

                config.onError && config.onError(state);
            };

            this.call = (config) =>
            {
                return config.api
                    ? commands.run.api(config.command, config.data)
                    : commands.run(config.command, config.data);
            };

            this.settle = (config, state) =>
            {
                compile.data[config.bind] = state;
                compile.data.Update();
            };

            this.run = async (config) =>
            {
                const state = {
                    response: null,
                    error: null,
                    loading: true
                };

                try
                {
                    this.landed(config, state, await this.call(config));
                }
                catch(error)
                {
                    this.failed(config, state, error);
                }
                finally
                {
                    this.settle(config, state);
                }
            };

            const bind = data['bind'].value;

            if(compile.data[bind] !== undefined)
            {
                return;
            }

            compile.data[bind] = null;
            this.run(this.config());
        }
    });
});
