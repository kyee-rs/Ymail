import { sweetid } from 'https://deno.land/x/sweetid@0.11.1/src/main.ts';
import { Composer } from '../../deps.deno.ts';
import { db } from '../handlers/database.ts';
import { deleteMenu } from '../handlers/menus.ts';
import type { Account, MyContext } from '../types/bot.d.ts';
import { bot } from './bot.ts';

export const commands = new Composer<MyContext>();

commands.use(async (ctx, next) => {
    if (ctx.message?.chat.type === 'private') {
        try {
            await db.create(`account:${ctx.chat?.id}`, {
                emails: [`${ctx.chat?.id}`],
                forward: true,
            });
        } catch {
            null;
        }
        await next();
    } else {
        return;
    }

    bot.catch((err) => {
        return console.log(`[ERROR] ${err.message}`);
    });
});

commands.command('start', async (ctx) => {
    await ctx.reply(
        'Hello, I am a Temporary Email Bot. I can generate one persistent email address for this chat and unlimited random emails that forward to it. You can use this email address to sign up for websites and services that require email verification. I will forward all emails to this chat. You can also use /help to get more information.',
    );
    await ctx.reply(
        `Your persistent email address is: ${ctx.chat.id}@${
            Deno.env.get('EMAIL_DOMAIN') || 'decline.live'
        }`,
    );
});

commands.command('help', async (ctx) => {
    await ctx.reply(
        `*Info*: This bot is a temporary email service.\n*Current domain*: ${
            Deno.env.get('EMAIL_DOMAIN') || 'decline.live'
        }.` +
            `\n*Persistent email address*: ${ctx.chat.id}@${
                Deno.env.get('EMAIL_DOMAIN') || 'decline.live'
            }` +
            `\n*Commands*:
/start - Start the bot
/help - Get help
/new - Generate a new email address
/delete - Delete the email address
/deleteall - Delete all email addresses
/list - List all email addresses
/forward - Toggle email forwarding`,
        { parse_mode: 'Markdown' },
    );
});

commands.command('new', async (ctx) => {
    const account: Account = await db.select(`account:${ctx.chat?.id}`);
    if (account.emails.length >= 6) {
        await ctx.reply(
            '❌ You have reached the maximum number of random emails.',
        );
    } else {
        const randomEmail = sweetid('m');
        const emailExists = await db.query<any>(
            `SELECT id FROM account WHERE emails CONTAINS "${randomEmail}";`,
        );

        if (emailExists[0].result?.length > 0) {
            await ctx.reply(
                '❌ An error occurred while generating the email address. Please try again.',
            );
            return;
        }

        await db.change(`account:${ctx.chat?.id}`, {
            emails: [...account.emails, randomEmail],
        });
        await ctx.reply(
            `✅ New email address generated: ${randomEmail}@${
                Deno.env.get('EMAIL_DOMAIN') || 'decline.live'
            }`,
        );
    }
});

commands.command('list', async (ctx) => {
    const account: Account = await db.select(`account:${ctx.chat?.id}`);
    await ctx.reply(
        `✅ Your emails:\n${
            account.emails.map((email: string) =>
                `${email}@${Deno.env.get('EMAIL_DOMAIN') || 'decline.live'}`
            ).join('\n')
        }`,
    );
});

commands.command('deleteall', async (ctx) => {
    await db.change(`account:${ctx.chat?.id}`, {
        emails: [
            `${ctx.chat?.id}`,
        ],
    });
    await ctx.reply('✅ All random emails deleted.');
});

commands.command('forward', async (ctx) => {
    const account: Account = await db.select(`account:${ctx.chat?.id}`);
    await db.change(`account:${ctx.chat?.id}`, {
        forward: !account.forward,
    });
    await ctx.reply(
        `✅ Email forwarding ${account.forward ? 'disabled' : 'enabled'}.`,
    );
});

commands.command('delete', async (ctx) => {
    const account: Account = await db.select(`account:${ctx.chat?.id}`);

    if (account.emails.length <= 1) {
        await ctx.reply(
            '❌ You cannot delete your persistent email address.',
        );
    } else {
        await ctx.reply('Select the email address you want to delete.', {
            reply_markup: deleteMenu,
        });
    }
});
