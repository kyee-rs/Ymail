import { InputFile, Router } from '../../deps.deno.ts';
import { bot } from '../core/bot.ts';
import { Account, WrappedQuery } from '../types/bot.d.ts';
import { db } from './database.ts';
import { renderHtml } from './menus.ts';

const normalize = (s: string) => {
    s = s.replace(/\s+/g, " ").trim()
    if (s.length > 2000) {
        s = s.substring(0, 2000) + "..."
    }
    return s;
}

export const messageListener = new Router().post('/receive', async (ctx) => {
    const secret = ctx.request.url.searchParams.get('secret');
    if (secret !== Deno.env.get('SECRET_KEY')) {
        ctx.response.status = 401;
        ctx.response.body = 'Unauthorized';
        return;
    }
    const bodyType = ctx.request.body().type;
    if (bodyType === 'form') {
        const body = await ctx.request.body({ type: 'form' }).value;
        const recipient = body.get('recipient')?.split(',');

        recipient?.forEach(async (r) => {
            const chat: WrappedQuery<Account> = await db.internal.query(
                `SELECT id, forward FROM account WHERE emails CONTAINS "${r.split('@')[0]}";`,
            );
            if (chat[0].result[0] == undefined) return;

            if (chat[0].result[0].forward == true) {
                try {
                    bot.api.sendMessage(
                        chat[0].result[0].id.split(':')[1],
                        `To: ${r}\nFrom: ${body.get('From')?.split('<')[1].slice(0, -1)
                        }\nSubject: ${body.get('subject') || 'No subject'}\n\n${normalize(body.get('stripped-text') || 'No message body')
                        }\n\n🚀 Rendered email: ${await renderHtml(
                            body.get('stripped-html') || 'No message body',
                        )}`,
                        { disable_web_page_preview: true },
                    );
                } catch {
                    return;
                }
            }
        });
    } else if (bodyType === 'form-data') {
        const body = await ctx.request.body({ type: 'form-data' }).value.read();
        const fields = body.fields;
        const files = body.files;
        const recipient = fields.recipient.split(',');
        recipient?.forEach(async (r) => {
            const chat: WrappedQuery<Account> = await db.internal.query(
                `SELECT id, forward FROM account WHERE emails CONTAINS "${r.split('@')[0]}";`,
            );
            if (chat[0].result[0] == undefined) return;

            if (chat[0].result[0].forward == true) {
                try {
                    await bot.api.sendMessage(
                        chat[0].result[0].id.split(':')[1],
                        `To: ${r}\nFrom: ${fields['From']?.split('<')[1].slice(0, -1)
                        }\nSubject: ${fields.subject || 'No subject'}\n\n${normalize(fields['stripped-text'] || 'No message body')
                        }\n\n🚀 Rendered email: ${await renderHtml(
                            fields['stripped-html'] || 'No message body',
                        )}`,
                        { disable_web_page_preview: true },
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