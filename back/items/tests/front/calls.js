// This file is part of OneType. Created and led by Dejan Tomic <hi@iamdejan.com>, co-authored by Stefan Pakic, onetype.ai

onetype.AddonReady('tests.front', (tests) =>
{
    tests.Item({
        id: 'commands:front/calls',
        addon: 'commands',
        description: 'Calling the server posts the command and its data to the one endpoint, hands back the data on success and the envelope on anything else.',
        callback: async function({ network, eval: read, assert })
        {
            this.called = (id) =>
            {
                return 'onetype.AddonGet("commands").run.api("' + id + '", { word: "sent" })'
                    + '.then(function(answer){ return JSON.stringify(answer); })';
            };

            this.succeeding = async () =>
            {
                await network({
                    '/api/commands/run': {
                        data: {
                            from: 'the server'
                        },
                        message: 'ok',
                        code: 200
                    }
                });

                const answered = await read(this.called('proof.remote'));

                assert.match(answered, 'the server', 'a call that works hands back the data alone');
                assert.falsy(String(answered).includes('"code"'), 'unwrapped out of its envelope');
            };

            this.posted = async () =>
            {
                const sent = await read('JSON.stringify(window.__requests[window.__requests.length - 1])');

                assert.match(sent, '/api/commands/run', 'the call goes to the one endpoint');
                assert.match(sent, 'POST', 'as a post');
                assert.match(sent, 'proof.remote', 'carrying the id it was asked for');
                assert.match(sent, 'sent', 'and the data beside it');
            };

            this.failing = async () =>
            {
                await network({
                    '/api/commands/run': {
                        data: null,
                        message: 'the server said no',
                        code: 403
                    }
                });

                const answered = await read(this.called('proof.refused'));

                assert.match(answered, 'the server said no', 'a call that fails hands back what the server said');
                assert.match(answered, '403', 'carrying the code it answered with');
            };

            this.unreachable = async () =>
            {
                await network({});

                const answered = await read(this.called('proof.nowhere'));

                assert.truthy(answered, 'a call the network refuses still answers something');
            };

            await this.succeeding();
            await this.posted();
            await this.failing();
            await this.unreachable();
        }
    });
});
