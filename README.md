# Commands

Commands turns a named callback into a typed, documented, runnable action. A command has an id, an input schema, an output schema and a callback. Register it once and you can run it locally, over HTTP, from the browser, from markup, or from another command. The addon has zero dependencies; transports depend on it, never the other way around.

- Package: `@onetype/addon-commands`, slug `onetype/addon/commands`
- Depends on: nothing. Supports: `onetype/addon/canon` and `onetype/addon/directives`
- Sides: `back/` (Node) and `front/` (browser)

## Define a command

One item, one file, under `items/commands/` of the owning addon:

```js
onetype.AddonReady('commands', (commands) =>
{
    commands.Item({
        id: 'posts:publish',
        addon: 'posts',
        description: 'Publishes one post by id.',
        exposed: true,
        method: 'POST',
        endpoint: '/api/posts/publish',
        in: {
            id: { type: 'string', required: true, description: 'Id of the post.' }
        },
        out: {
            published: { type: 'boolean', description: 'Whether the post is now live.' }
        },
        callback: async function(properties, resolve)
        {
            resolve({ published: true });
        }
    });
});
```

Field reference, in canon order:

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | string | Addon then action with colons, like `vault:set` or `work:tasks:create`. |
| `addon` | string | The owning addon. |
| `description` | string | What the command does, one sentence. |
| `exposed` | boolean | Answers over HTTP when true. Unexposed commands are invisible to transports and discovery. |
| `method` | string | GET, POST, PUT or DELETE. |
| `endpoint` | string | HTTP path. Supports `:param` segments, like `/api/posts/:id`. |
| `type` | string | Response type: JSON, HTML, CSS or JS. |
| `metadata` | json | Free tags. |
| `silent` | boolean | Composite commands mark themselves so telemetry logs them once. |
| `in` | object or string | Input schema, inline defines or a registered schema name. Leave out when the command takes nothing. |
| `out` | object or string | Output schema. Leave out when the shape is free. |
| `condition` | function | Guard, see below. Leave out when open. |
| `callback` | function | The body: `async function(properties, resolve)`. |

## Run a command

```js
const result = await commands.run('posts:publish', { id: 'abc' });

result.data;      // what the callback resolved, shaped by the out schema
result.message;   // human readable outcome
result.code;      // 200, or the code the callback chose
result.time;      // execution milliseconds as a string
```

Every run returns the same envelope: `{ data, message, code, time, end }`. `commands.run` exists on both sides. An unknown id throws a `404` OneType error; everything else resolves the envelope, including failures:

| Code | When |
| --- | --- |
| 200 | The callback resolved. |
| 400 | Input failed validation: missing required field or an unknown key. The callback never ran. |
| 403 | The condition returned a string; that string is the message. |
| 409 | A middleware intercept cancelled the run. |
| 500 | Resolved data broke the out contract, or the callback threw. A throw rejects the promise. |

`resolve(data, message, code)` inside a callback picks all three; message defaults to a success sentence, code to 200.

## Validation is the contract

- Input is sealed against `in`: unknown keys resolve `400`, missing `required` fields resolve `400`, absent optional fields take the `value` of their define. Defaults live in the schema, never in the callback.
- Output is sealed against `out` on every 2xx resolve: a field the schema does not name raises a loud `500 OUT error` and rejects the run. Nothing is silently dropped.
- A command with no `in` receives `{}` no matter what was passed.

## Guard a command

```js
condition: function()
{
    return this.user ? undefined : 'Login first.';
}
```

The guard runs with the caller context as `this` (an HTTP run carries `this.http` with request, response and state). Returning a string blocks the run with `403` and that message. Trusted internal calls skip the guard: `item.Fn('run', properties, context, { direct: true })`.

## Stream a run

A callback may resolve many times. `end: false` emits a chunk, the final resolve settles:

```js
callback: async function(properties, resolve)
{
    for(const step of steps)
    {
        resolve({ step }, 'working', 200, false);
    }

    resolve({ done: true }, 'finished', 200, true);
}
```

Consume chunks with `item.Fn('run', properties, context, { onChunk: (chunk) => ... })`. A run settles once: after the first ending resolve every later resolve and chunk is inert, and the `commands.run` emitter fires exactly once. Over HTTP a client passes a `streaming` input flag and receives newline delimited chunks.

## Observe and intercept every run

```js
onetype.emitters.catch('commands.run', (run) =>
{
    // run: { id, input, data, message, code, time, context, direct } after every run, success or failure
});

onetype.middlewares.intercept('commands.run', async (chain) =>
{
    if(chain.value.id === 'posts:publish')
    {
        chain.value.cancel = true;   // resolves 409, the callback never runs
    }

    await chain.next();
});
```

The middleware sees `{ id, properties, cancel }` after input validation, before the callback. The emitter context is passed by reference: read during the emit, never hold or serialize it.

## Call over HTTP

Everything exposed self describes:

| Endpoint | Command | Returns |
| --- | --- | --- |
| `GET /api/commands` | `commands:get:many` | Every exposed command with id, description, method, endpoint, type and both schemas. The machine readable catalog. |
| `GET /api/commands/:id` | `commands:get:one` | One described command. `403` unexposed, `404` unknown. |
| `POST /api/commands/run` | `commands:run` | Runs `{ id, data }` and returns the inner envelope. Refuses unknown (`404`) and unexposed (`403`) ids. |

A command with its own `endpoint` also answers there directly; `:param` segments bind into the input by name.

`commands.find(method, pathname)` (back) resolves a method and path to a command item: exact endpoint first, then `:param` endpoints segment by segment, then the `/*` catch all. Matching is case insensitive.

## From the browser

```js
await commands.run('posts:publish', { id });        // runs in the browser registry
await commands.run.api('posts:publish', { id });    // POSTs to /api/commands/run, runs on the server
```

Use `run.api` when the command only exists on the back or must run with server authority. It returns the inner envelope; a transport failure returns `{ data: null, message, code: 500 }`.

In markup, the `ot-command` directive runs a command on render and binds its state:

```html
<ot-command use="posts:many" bind="posts" :data="{ page: 1 }" :api="true"></ot-command>
<div ot-if="posts.loading">Loading...</div>
<div ot-for="post in posts.response.data"></div>
```

The bound state is `{ response, error, loading }`. A bind key that already holds a value skips the run. Every non 2xx envelope lands in `error` and calls `_error`; only a 2xx calls `_success`. Attributes: `use` (required, the command id), `bind` (defaults to `command`), `data`, `api`, `_success`, `_error`.

`api` is a boolean, so it takes the binding colon. A plain `api="true"` hands the string to a boolean define, which reads it as false and runs the command in the browser registry instead of on the server. Every non string attribute is the same: the colon is what carries a type across.

## Compose commands

Run a command from a command and forward the caller context so guards keep working:

```js
callback: async function(properties, resolve)
{
    const result = await commands.ItemGet('posts:render').Fn('run', properties, this);

    resolve(result.data, result.message, result.code);
}
```

Mark the outer command `silent: true` so telemetry logs the pair once.

## What the tests hold it to

With `@onetype/addon-tests` present, four tests register under `back/items/tests/`:

| Test | Holds |
| --- | --- |
| `back/runs` | A run answers one envelope with data, message, code and time; bad input answers 400 and an unknown id throws. |
| `back/routes` | An exact endpoint wins, a `:parameter` stands in, the method tells two apart, and a guard that speaks answers 403. |
| `front/reaches` | The addon reaches the browser carrying `run`, `run.api` and the `ot-command` tag, and a command registered there runs there. |
| `front/calls` | `run.api` posts the id and the data to the one endpoint, unwrapping the data on success and the envelope on anything else. |

Run them with `tests.run('commands')`.

## Guarantees

- No silent failures: unknown ids throw, out of contract data raises `OUT error`, unknown input keys resolve `400`.
- Every result is the same envelope shape; every run is observable through the emitter and cancellable through the middleware.
- Everything exposed is self describing: `GET /api/commands` is generated from the same registrations that execute.
