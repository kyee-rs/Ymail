import { DB } from '../core/database.ts';

export const db = await (new DB()).init({
    user: Deno.env.get('USER') || 'root',
    pass: Deno.env.get('PASS') || 'root',
});
