// This file is part of OneType. Created and led by Dejan Tomic <hi@iamdejan.com>, co-authored by Stefan Pakic, onetype.ai

onetype.AddonReady('tests.front', (tests) =>
{
    tests.Item({
        id: 'commands:front/binds',
        addon: 'commands',
        description: 'The ot-command tag runs on render and binds the answer, so the markup around it reads the response and the error.',
        callback: async function({ mount, network, settle, eval: read, assert })
        {
            this.settled = async () =>
            {
                settle();

                await new Promise((waited) => setTimeout(waited, 150));

                settle();
            };

            this.answered = async () =>
            {
                await network({
                    '/api/commands/run': {
                        data: {
                            rows: [{ title: 'first' }, { title: 'second' }]
                        },
                        message: 'ok',
                        code: 200
                    }
                });

                await mount('<div>'
                    + '<ot-command use="proof:many" bind="posts" :api="true"></ot-command>'
                    + '<span id="waiting">{{ posts.loading }}</span>'
                    + '<ul><li class="row" ot-for="row in posts.response.rows">{{ row.title }}</li></ul>'
                    + '</div>');

                await this.settled();

                assert.text('#waiting', 'false', 'the run finished waiting');
                assert.count('.row', 2, 'the answer reached the markup around it');
                assert.text('.row', 'first', 'carrying what the server said');
            };

            this.posted = async () =>
            {
                const sent = await read('window.__requests.length ? JSON.parse(window.__requests[0].options.body).id : "nothing"');

                assert.equal(sent, 'proof:many', 'the tag called the command it names');
            };

            this.failed = async () =>
            {
                await network({
                    '/api/commands/run': {
                        data: null,
                        message: 'the server said no',
                        code: 403
                    }
                });

                await mount('<div>'
                    + '<ot-command use="proof:refused" bind="posts" :api="true"></ot-command>'
                    + '<span id="broke">{{ posts.error }}</span>'
                    + '</div>');

                await this.settled();

                assert.contains('#broke', 'no', 'an answer the server refused lands on error');
            };

            await this.answered();
            await this.posted();
            await this.failed();
        }
    });
});
