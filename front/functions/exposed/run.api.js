commands.FnExpose('run.api', async function(id, data = {})
{
    try
    {
        const response = await fetch('/api/commands/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, data })
        });

        const result = await response.json();

        if(result.code !== 200)
        {
            return {
                data: null,
                message: result.message,
                code: result.code
            };
        }

        return result.data;
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
