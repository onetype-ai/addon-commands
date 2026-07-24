# Commands

Commands is the OneType addon that turns a named callback into a typed, documented, runnable action. A command has an id, an input schema, an output schema and a callback. Everything else (HTTP exposure, gRPC streaming, telemetry, permission guards) hangs off that one registration. The addon has zero dependencies; transports depend on it, never the other way around.

- Package: `@onetype/addon-commands`, slug `onetype/addon/commands`
- Depends on: nothing. Supports: `onetype/addon/canon` (pattern and placement items that activate when canon is present) and `onetype/addon/directives` (the `ot-command` directive registers when directives are present)
- Sides: `back/` (Node) and `front/` (browser, shipped as an asset bundle registered in `back/items/onetype/assets/commands.js`)

## Registering a command

A command is one item in one file under `items/commands/` of the owning addon, wrapped in `AddonReady`:

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

Fields, in canon order: `id` (addon then action with colons, like `vault:set`), `addon` (owner), `description`, `exposed` (answers over HTTP when true), `method` (GET/POST/PUT/DELETE), `endpoint` (HTTP path, supports `:param` segments), `type` (JSON/HTML/CSS/JS response type), `metadata` (free json tags), `silent` (composite commands mark themselves so telemetry logs them once), `in` (input schema or schema name), `out` (output schema or schema name), `condition` (guard), `callback` (the body). `in`, `out` and `condition` are left out when empty.

## The run lifecycle

`item.run` (back: `back/item/functions/run.js`, front: `front/item/functions/run.js`) drives every execution:

1. **Input validation.** `properties` are sealed against the `in` schema: missing required fields or unknown keys resolve `400` without reaching the callback. A command with no `in` receives an empty object, whatever was passed.
2. **Middleware.** The `commands.run` middleware chain runs with `{ id, properties, cancel }`. An intercept that sets `cancel: true` resolves `409` and the callback never runs.
3. **Condition.** When the command has a `condition` and the run is not direct, the guard is called with the run context as `this`. Returning a string blocks the run: that string becomes the message of a `403` result.
4. **Callback.** Called as `callback.call(context, properties, resolve, direct)`. The context carries transport state (an HTTP run carries `this.http` with request, response and state).
5. **Output validation.** On a 2xx resolve with an `out` schema, the data is sealed against it. Data that violates the contract raises a `500` `OUT error`. The run rejects loudly, nothing is silently dropped.
6. **Emit.** Every run, success or failure, fires the `commands.run` emitter with `{ id, input, data, message, code, time, context, direct }`.

The resolve signature is `resolve(data, message, code, end)`. Every result is an envelope: `{ data, message, code, time, end }`, with `time` in milliseconds as a string.

Back `item.run` signature: `Fn('run', properties, context, options)` where `options` is `{ direct, onChunk }`. Front is the same minus `direct`. `direct: true` marks a trusted internal call and skips the condition.

## Streaming

A callback may resolve many times: `resolve(chunk, message, 200, false)` emits a chunk, the final `resolve(data, message, code, true)` ends the run. Chunks flow to `options.onChunk`; only the ending resolve settles the promise and fires the emitter. Over HTTP a client opts in with a `streaming` input flag and receives newline-delimited formatted chunks.

## Exposed functions

- `commands.run(id, data)`, back and front. Looks the command up and runs it; throws a `404` OneType error when the id does not exist. Registered as `exposed.run` from `functions/exposed/run.js`.
- `commands.find(method, pathname)`, back only. Resolves an HTTP method and pathname to a command item: exact endpoint match first, then `:param` endpoints segment by segment, then the `/*` catch-all. Pathname matching is case insensitive.
- `commands.run.api(id, data)`, front only. Runs the command on the server by POSTing `{ id, data }` to `/api/commands/run` and returns the inner envelope. Use it when the command only exists on the back or must run with server authority.

## Built-in commands

- `commands:run` on `POST /api/commands/run`, silent. Composite runner: takes `{ id, data }`, refuses unknown (`404`) and unexposed (`403`) ids, forwards the caller context, returns the inner envelope.
- `commands:get:many` on `GET /api/commands`, silent. Lists every exposed command with id, description, method, endpoint, type and both schemas: the machine-readable API catalog.
- `commands:get:one` on `GET /api/commands/:id`, silent. Describes one exposed command; `403` for unexposed, `404` for unknown.

## Registry surface

- Schema `command` (`items/onetype/schemas/command.js`, both sides) is the shape of a described command, used by `get:one`/`get:many` outputs.
- Emitter `commands.run` (`items/onetype/emitters/commands.run.js`) fires after every execution. The `context` field is passed by reference: read it during the emit, never hold or serialize it.
- Middleware `commands.run` (`items/onetype/middlewares/commands.run.js`) runs before every callback, after input validation; intercepts may inspect properties and cancel.

## Front directive

`<ot-command command="posts:many" bind="posts">` (`front/items/directives/664.ot.command.js`) runs a command on render and binds `{ response, error, loading }` to the compile data under `bind`. Attributes: `command` (required), `bind` (default `command`), `data`, `api` (boolean, routes through `commands.run.api`), `_success`/`_error` callbacks.

## Guarantees

- No silent failures: unknown function names throw, out-of-contract data raises `OUT error`, unknown input keys resolve `400`.
- Every result is the same envelope shape; every run is observable through the `commands.run` emitter and cancellable through the middleware.
- Everything exposed is self-describing: `GET /api/commands` is generated from the same registrations that execute.
