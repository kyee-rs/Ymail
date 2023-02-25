import { Menu, MenuRange } from '../../deps.deno.ts';
import { db } from './database.ts';
export const deleteMenu = new Menu('deleteMenu')
    .dynamic(async (ctx) => {
        const emails = (await db.select(`account:${ctx.chat?.id}`))[0].emails;
        const range = new MenuRange();
        for (const email of emails) {
            if (email !== `${ctx.chat?.id}`) {
                range
                    .text(email, async (ctx) => {
                        await ctx.reply(
                            `☑️ Pattern \`${email}\` deleted successfully.`,
                        );
                        await db.change(`account:${ctx.chat?.id}`, {
                            emails: emails.filter(
                                (e) => e !== email,
                            ),
                        });
                    })
                    .row();
            }
        }
        return range;
    })
    .text('🚫 Cancel', async (ctx) => await ctx.deleteMessage());
