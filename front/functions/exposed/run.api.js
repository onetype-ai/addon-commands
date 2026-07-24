commands.FnExpose('run.api', async function(id, data = {})
{
    this.request = () =>
    {
        return fetch('/api/commands/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, data })
        });
    };

    this.unwrap = (result) =>
    {
        if(result.code === 200)
        {
            return result.data;
        }

        return {
            data: null,
            message: result.message,
            code: result.code
        };
    };

    try
    {
        const response = await this.request();

        return this.unwrap(await response.json());
    }
    catch(error)
    {
        return {
            data: null,
            message: error.message,
            code: 500
        };
    }
});
