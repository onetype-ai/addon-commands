// This file is part of OneType. Created and led by Dejan Tomic <hi@iamdejan.com>, co-authored by Stefan Pakic, onetype.ai

import commands from '#commands/back/addon.js';

commands.FnExpose('find', function(method, pathname)
{
    this.exact = (items, target) =>
    {
        return items.find((item) => item.Get('endpoint') === target);
    };

    this.matches = (endpoint, parts) =>
    {
        const segments = endpoint.split('/');

        return segments.length === parts.length
            && segments.every((segment, index) => segment.startsWith(':')
                || segment === parts[index]);
    };

    this.params = (items, target) =>
    {
        const parts = target.split('/');

        return items.find((item) => (item.Get('endpoint') + '').includes(':')
            && this.matches(item.Get('endpoint'), parts));
    };

    const target = pathname.toLowerCase();
    const items = Object.values(this.Items()).filter((item) => item.Get('method') === method);

    return this.exact(items, target)
        || this.params(items, target)
        || Object.values(this.Items()).find((item) => item.Get('endpoint') === '/*');
});
