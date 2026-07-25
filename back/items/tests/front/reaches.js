// This file is part of OneType. Created and led by Dejan Tomic <hi@iamdejan.com>, co-authored by Stefan Pakic, onetype.ai

onetype.AddonReady('tests.front', (tests) =>
{
    tests.Item({
        id: 'commands:front/reaches',
        addon: 'commands',
        description: 'The addon reaches the browser carrying its own runner, the one that calls the server, and the tag that runs a command on render.',
        callback: async function({ eval: read, assert })
        {
            this.arrived = async () =>
            {
                assert.equal(await read('typeof onetype.AddonGet("commands")'), 'object', 'the addon reached the page');
                assert.equal(await read('typeof onetype.AddonGet("commands").run'), 'function', 'carrying the runner');
                assert.equal(await read('typeof onetype.AddonGet("commands").run.api'), 'function', 'and the one that calls the server');
            };

            this.tagged = async () =>
            {
                const directives = await read('!!(onetype.AddonGet("directives") || { Items: function(){ return {}; } }).Items()["ot-command"]');

                assert.truthy(directives, 'the ot-command tag stands with the directives');
            };

            this.locally = async () =>
            {
                const answered = await read('(function(){'
                    + ' var addon = onetype.AddonGet("commands");'
                    + ' addon.Item({ id: "proof.here", description: "Runs in the page.",'
                    + '   in: { word: { type: "string", required: true, description: "w" } },'
                    + '   callback: function(properties, resolve){ resolve({ heard: properties.word }, "said", 200); } });'
                    + ' return addon.run("proof.here", { word: "in the browser" }).then(function(envelope){ return JSON.stringify(envelope); });'
                    + '})()');

                assert.match(answered, 'in the browser', 'a command registered in the page runs there');
                assert.match(answered, '"code":200', 'answering the same envelope the back does');
            };

            this.refusing = async () =>
            {
                const answered = await read('onetype.AddonGet("commands").run("proof.here", {})'
                    + '.then(function(envelope){ return JSON.stringify(envelope); })');

                assert.match(answered, '"code":400', 'input the schema refuses is refused in the page too');
            };

            await this.arrived();
            await this.tagged();
            await this.locally();
            await this.refusing();
        }
    });
});
