import commands from '#commands/back/addon.js';

commands.FnExpose('find', function(method, pathname)
{
    this.exact = (items, target) =>
    {
        return items.find((item) => item.Get('endpoint') === target);
    };

    this.same = (segment, part) =>
    {
        if(segment.startsWith(':'))
        {
            return true;
        }

        return segment === part;
    };

    this.matches = (endpoint, parts) =>
    {
        const segments = endpoint.split('/');

        return segments.length === parts.length
            && segments.every((segment, index) => this.same(segment, parts[index]));
    };

    this.params = (items, target) =>
    {
        const parts = target.split('/');

        return items.find((item) => (item.Get('endpoint') + '').includes(':') && this.matches(item.Get('endpoint'), parts));
    };

    const target = pathname.toLowerCase();
    const items = Object.values(this.Items()).filter((item) => item.Get('method') === method);
    const exact = this.exact(items, target);

    if(exact)
    {
        return exact;
    }

    const parameterized = this.params(items, target);

    if(parameterized)
    {
        return parameterized;
    }

    return Object.values(this.Items()).find((item) => item.Get('endpoint') === '/*');
});
