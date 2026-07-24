// This file is part of OneType. Created and led by Dejan Tomic <hi@iamdejan.com>, co-authored by Stefan Pakic, onetype.ai

import commands from '#commands/back/addon.js';

import '#commands/back/items/onetype/schemas/command.js';
import '#commands/back/items/onetype/emitters/commands.run.js';
import '#commands/back/items/onetype/middlewares/commands.run.js';

import '#commands/back/item/functions/shape.js';
import '#commands/back/item/functions/run.js';

import '#commands/back/functions/exposed/run.js';
import '#commands/back/functions/exposed/find.js';

import '#commands/back/items/canon/placements/items.js';
import '#commands/back/items/canon/patterns/items.js';
import '#commands/back/items/commands/run.js';
import '#commands/back/items/commands/get.one.js';
import '#commands/back/items/commands/get.many.js';

export default commands;
