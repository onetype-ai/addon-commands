// This file is part of OneType. Created and led by Dejan Tomic <hi@iamdejan.com>, co-authored by Stefan Pakic, onetype.ai

onetype.AddonReady('tests.back', (tests) =>
{
    tests.Item({
        id: 'commands:back/routes',
        addon: 'commands',
        description: 'Finding a command matches the method and the path, letting an exact endpoint win, a parameter stand in and a guard turn a run away.',
        callback: async function({ assert })
        {
            this.commands = onetype.AddonGet('commands');

            this.planted = () =>
            {
                const answer = (properties, resolve) =>
                {
                    resolve({}, 'ok', 200);
                };

                this.commands.Item({
                    id: 'proof.list',
                    description: 'Answers the list.',
                    method: 'GET',
                    endpoint: '/proof/posts',
                    exposed: true,
                    callback: answer
                });

                this.commands.Item({
                    id: 'proof.one',
                    description: 'Answers one.',
                    method: 'GET',
                    endpoint: '/proof/posts/:id',
                    exposed: true,
                    callback: answer
                });

                this.commands.Item({
                    id: 'proof.make',
                    description: 'Writes one.',
                    method: 'POST',
                    endpoint: '/proof/posts',
                    exposed: true,
                    callback: answer
                });

                this.commands.Item({
                    id: 'proof.guarded',
                    description: 'Turns the run away.',
                    condition: function()
                    {
                        return 'the guard says no';
                    },
                    callback: answer
                });
            };

            this.found = (method, path) =>
            {
                const command = this.commands.find(method, path);

                return command ? command.Get('id') : null;
            };

            this.exact = () =>
            {
                assert.equal(this.found('GET', '/proof/posts'), 'proof.list', 'an exact path finds its command');
                assert.equal(this.found('POST', '/proof/posts'), 'proof.make', 'and the method tells two apart');
            };

            this.parameterised = () =>
            {
                assert.equal(this.found('GET', '/proof/posts/7'), 'proof.one', 'a parameter stands in for a segment');
            };

            this.missing = () =>
            {
                assert.falsy(this.found('GET', '/nothing/lives/here'), 'a path nobody answers finds nothing');
                assert.falsy(this.found('DELETE', '/proof/posts'), 'and neither does a method nobody answers');
            };

            this.lowered = () =>
            {
                assert.equal(this.found('GET', '/PROOF/POSTS'), 'proof.list', 'the path is read without its case');
            };

            this.guarded = async () =>
            {
                const envelope = await this.commands.run('proof.guarded');

                assert.equal(envelope.code, 403, 'a guard that speaks turns the run away');
                assert.equal(envelope.message, 'the guard says no', 'answering with what the guard said');
                assert.equal(envelope.data, null, 'and carrying no data');
            };

            this.planted();

            this.exact();
            this.parameterised();
            this.missing();
            this.lowered();

            await this.guarded();
        }
    });
});
