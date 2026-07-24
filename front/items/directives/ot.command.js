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

            this.init = () =>
            {
                this.config();

                if(compile.data[this.bind] !== undefined)
                {
                    return;
                }

                compile.data[this.bind] = null;
                this.run();
            };

            this.config = () =>
            {
                this.command = data['command'].value;
                this.bind = data['bind'].value;
                this.data = data['data'].value;
                this.api = data['api'].value;
                this.onSuccess = data['_success'].value;
                this.onError = data['_error'].value;
            };

            this.run = async () =>
            {
                const state = {
                    response: null,
                    error: null,
                    loading: true
                };

                try
                {
                    const result = this.api
                        ? await commands.run.api(this.command, this.data)
                        : await commands.run(this.command, this.data);

                    if(result.code < 200 || result.code >= 300)
                    {
                        state.response = result;
                        state.error    = result.message;
                        state.loading  = false;

                        this.onError && this.onError(state);

                        return;
                    }

                    state.response = result;
                    state.error    = null;
                    state.loading  = false;

                    this.onSuccess && this.onSuccess(state);
                }
                catch(error)
                {
                    state.response = null;
                    state.error    = error.message;
                    state.loading  = false;

                    this.onError && this.onError(state);
                }
                finally
                {
                    compile.data[this.bind] = state;
                    compile.data.Update();
                }
            };

            this.init();
        }
    });
});
