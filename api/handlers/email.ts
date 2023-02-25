import { InputFile, Router } from '../../deps.deno.ts';
import { bot } from '../core/bot.ts';
import { Account, WrappedQuery } from '../types/bot.d.ts';
import { db } from './database.ts';
export const messageListener = new Router().post('/receive', async (ctx) => {
    const secretkey = ctx.request.url.searchParams.get('secret');
    if (secretkey !== Deno.env.get('SECRET_KEY')) {
        ctx.response.status = 401;
        ctx.response.body = 'Unauthorized';
        return;
    }
    
    const bodytype = ctx.request.body().type;
    if (bodytype === 'form') {
        const body = await ctx.request.body({ type: 'form' }).value;
        const recipient = body.get('recipient')?.split(',');

        recipient?.forEach(async (r) => {
            const chat: WrappedQuery<Account> = await db.internal.query(
                `SELECT id, forward FROM account WHERE emails CONTAINS "${
                    r.split('@')[0]
                }";`,
            );
            if (chat[0].result[0] == undefined) return;

            if (chat[0].result[0].forward == true) {
                try {
                    bot.api.sendMessage(
                        chat[0].result[0].id.split(':')[1],
                        `*To*: ${r}\n*From*: ${
                            body.get('From')?.split('<')[1].slice(0, -1)
                        }\n*Subject*: ${body.get('subject') || "*No subject*"}\n\n${
                            body.get('body-plain') || "*No message body*"
                        }`,
                        { parse_mode: 'Markdown' },
                    );
                } catch {
                    return;
                }
            }
        });
    } else if (bodytype === 'form-data') {
        const body = await ctx.request.body({ type: 'form-data' }).value.read();
        const fields = body.fields;
        const files = body.files;
        const recipient = fields.recipient.split(',');
        recipient?.forEach(async (r) => {
            const chat: WrappedQuery<Account> = await db.internal.query(
                `SELECT id, forward FROM account WHERE emails CONTAINS "${
                    r.split('@')[0]
                }";`,
            );
            if (chat[0].result[0] == undefined) return;

            if (chat[0].result[0].forward == true) {
                try {
                    bot.api.sendMessage(
                        chat[0].result[0].id.split(':')[1],
                        `*To*: ${r}\n*From*: ${
                            fields['From']?.split('<')[1].slice(0, -1)
                        }\n*Subject*: ${fields.subject || "*No subject*"}\n\n${
                            fields['body-plain'] || "*No message body*"
                        }`,
                        { parse_mode: 'Markdown' },
                    );
                    files?.forEach(async (f) => {
                        const file = await Deno.readFile(f.filename!);
                        bot.api.sendDocument(
                            chat[0].result[0].id.split(':')[1],
                            new InputFile(file, f.originalName),
                        );
                    });
                } catch {
                    return;
                }
            }
        });
    }

    ctx.response.status = 200;
    ctx.response.body = 'OK';
});
