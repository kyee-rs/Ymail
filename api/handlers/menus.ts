import { Menu, MenuRange } from '../../deps.deno.ts';
import { Account } from '../types/bot.d.ts';
import { db } from './database.ts';
export const deleteMenu = new Menu('deleteMenu')
    .dynamic(async (ctx) => {
        const account: Account = await db.select(`account:${ctx.chat?.id}`);
        const range = new MenuRange();
        for (const email of account.emails) {
            if (email !== `${ctx.chat?.id}`) {
                range
                    .text(email, async (ctx) => {
                        await ctx.reply(
                            `☑️ Pattern \`${email}\` deleted successfully.`,
                            { parse_mode: 'Markdown' },
                        );
                        await db.change<Account, { emails: string[] }, string>(
                            `account:${ctx.chat?.id}`,
                            {
                                emails: account.emails.filter(
                                    (e) => e !== email,
                                ),
                            },
                        );
                    })
                    .row();
            }
        }
        return range;
    })
    .text('🚫 Cancel', async (ctx) => await ctx.deleteMessage());

// Render HTML Content on cdn.lowt.live and upload it.
export const renderHtml = async (html: string) => {
    const formData = new FormData();
    formData.append(
        'file',
        new Blob([html || 'No message body. Try again later.']),
        'email.html',
    );
    const resp = await fetch('https://cdn.lowt.live', {
        method: 'POST',
        body: formData,
        headers: {
            'Parse_HTML': 'yes',
        },
    });
    return await resp.text();
};
