// This file is part of OneType. Created and led by Dejan Tomic <hi@iamdejan.com>, co-authored by Stefan Pakic, onetype.ai

onetype.AddonReady('tests.back', (tests) =>
{
    tests.Item({
        id: 'commands:back/runs',
        addon: 'commands',
        description: 'Running a command answers one envelope carrying the data, the message, the code and the time it took, whatever the command did.',
        callback: async function({ assert })
        {
            this.commands = onetype.AddonGet('commands');

            this.planted = () =>
            {
                this.commands.Item({
                    id: 'proof.echo',
                    description: 'Answers with what it was handed.',
                    in: {
                        word: {
                            type: 'string',
                            required: true,
                            description: 'What the command repeats back.'
                        }
                    },
                    callback: function(properties, resolve)
                    {
                        resolve({ heard: properties.word }, 'said it', 200);
                    }
                });

                this.commands.Item({
                    id: 'proof.broken',
                    description: 'Gives up on purpose.',
                    callback: function()
                    {
                        throw onetype.Error(500, 'The callback gave up.');
                    }
                });
            };

            this.answered = async () =>
            {
                const envelope = await this.commands.run('proof.echo', { word: 'hello' });

                assert.equal(envelope.code, 200, 'the code says it worked');
                assert.equal(envelope.message, 'said it', 'the message is the one it wrote');
                assert.equal(envelope.data.heard, 'hello', 'and the data carries what it answered');
                assert.equal(envelope.end, true, 'the envelope closes the run');
                assert.truthy(envelope.time, 'and names how long it took');
            };

            this.refused = async () =>
            {
                const envelope = await this.commands.run('proof.echo', {});

                assert.equal(envelope.code, 400, 'input the schema refuses answers four hundred');
                assert.match(envelope.message, 'invalid input', 'and says so');
                assert.match(envelope.message, 'word', 'naming the field that was missing');
            };

            this.absent = async () =>
            {
                await assert.throws(() => this.commands.run('nobody.registered.this'), 'running a command nobody registered');
            };

            this.broken = async () =>
            {
                await assert.throws(() => this.commands.run('proof.broken'), 'a command that gives up');
            };

            this.planted();

            await this.answered();
            await this.refused();
            await this.absent();
            await this.broken();
        }
    });
});
