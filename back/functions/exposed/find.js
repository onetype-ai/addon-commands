import commands from '#commands/back/addon.js';

commands.FnExpose('find', function(method, pathname)
{
    const normalizedPathname = pathname.toLowerCase();

    const items = Object.values(this.Items()).filter((item) => item.Get('method') === method);

    for (const item of items)
    {
        if (item.Get('endpoint') === normalizedPathname)
        {
            return item;
        }
    }

    for (const item of items)
    {
        const endpoint = item.Get('endpoint');

        if (!(endpoint + '').includes(':'))
        {
            continue;
        }

        const endpointParts = endpoint.split('/');
        const pathParts = normalizedPathname.split('/');

        if (endpointParts.length !== pathParts.length)
        {
            continue;
        }

        const matches = endpointParts.every((part, index) => part.startsWith(':') || part === pathParts[index]);

        if (matches)
        {
            return item;
        }
    }

    return Object.values(this.Items()).find((item) => item.Get('endpoint') === '/*');
});
