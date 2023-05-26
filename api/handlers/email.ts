import { InputFile, Router } from '../../deps.deno.ts';
import { bot } from '../core/bot.ts';
import { Account } from '../types/bot.d.ts';
import { db } from './database.ts';
import { renderHtml } from './menus.ts';

const n = (s: string) => {
    s = s.replace(/\s+/g, ' ').trim();
    if (s.length > 2000) {
        s = s.substring(0, 2000) + '...';
    }
    return s;
};

export const messageListener = new Router().post(
    '/receive',
    async (ctx) => {
        // Check if the secret key is valid
        const secret = ctx.request.url.searchParams.get('secret');
        if (secret !== Deno.env.get('SECRET_KEY')) {
            ctx.response.status = 401;
            ctx.response.body = 'Unauthorized';
            return;
        }

        // Get the type of the request body
        const bodyType = ctx.request.body().type;

        // Handle form-encoded bodies
        if (bodyType === 'form') {
            const body = await ctx.request.body({ type: 'form' }).value;

            // Get the recipients
            const recipients = body.get('recipient')?.split(',');

            // Iterate over each recipient
            recipients?.forEach(async (recipient) => {
                // Get the account associated with this recipient
                const result: Account[] = (await db.query<[Account[]]>(
                    `SELECT id, forward FROM account WHERE string::lowercase(string::join(",", emails) CONTAINS string::lowercase("${
                        recipient.split('@')[0]
                    }"))`,
                ))[0].result as Account[];

                // If no account was found, return early
                if (result.length == 0) {
                    return;
                }

                // If the account has forwarding enabled
                if (result[0].forward == true) {
                    // Send the message to the user
                    try {
                        bot.api.sendMessage(
                            result[0].id.split(':')[1],
                            `To: ${recipient}\nFrom: ${
                                body.get('From')?.split('<')[1].slice(
                                    0,
                                    -1,
                                )
                            }\nSubject: ${
                                body.get('subject') || 'No subject'
                            }\n\n${
                                n(
                                    body.get('stripped-text') ||
                                        'No message body',
                                )
                            }\n\n🚀 Rendered email: ${await renderHtml(
                                body.get('stripped-html') ||
                                    'No message body',
                            )}`,
                            { disable_web_page_preview: true },
                        );
                    } catch {
                        return;
                    }
                }
            });
        } else if (bodyType === 'form-data') {
            const body = await ctx.request.body({ type: 'form-data' })
                .value.read();
            const fields = body.fields;
            const files = body.files;
            const recipients = fields.recipient.split(',');

            // Split recipient emails into array and iterate through each one
            recipients?.forEach(async (recipient) => {
                // Query database for account with email address matching recipient
                const result: Account[] = (await db.query<[Account[]]>(
                    `SELECT id, forward FROM account WHERE string::lowercase(string::join(",", emails) CONTAINS string::lowercase("${
                        recipient.split('@')[0]
                    }"))`,
                ))[0].result as Account[];

                // If there is no result, return
                if (result.length == 0) {
                    return;
                }

                // If account is configured to forward email, send it to the bot
                if (result[0].forward == true) {
                    try {
                        await bot.api.sendMessage(
                            result[0].id.split(':')[1],
                            `To: ${recipient}\nFrom: ${
                                fields['From']?.split('<')[1].slice(0, -1)
                            }\nSubject: ${
                                fields.subject || 'No subject'
                            }\n\n${
                                n(
                                    fields['stripped-text'] ||
                                        'No message body',
                                )
                            }\n\n🚀 Rendered email: ${await renderHtml(
                                fields['stripped-html'] ||
                                    'No message body',
                            )}`,
                            { disable_web_page_preview: true },
                        );
                        files?.forEach(async (f) => {
                            const file = await Deno.readFile(f.filename!);
                            bot.api.sendDocument(
                                result[0].id,
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
    },
);
