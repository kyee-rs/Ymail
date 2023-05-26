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
        '✅ Welcome to [Ymail](https://github.com/voxelin/Ymail)! This bot is a temporary email service. You can use it to create random email addresses that will forward emails to your Telegram account.\nUse /help to get started.',
        { parse_mode: 'Markdown' },
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
    if (account.emails.length >= 100) {
        await ctx.reply(
            '❌ You have reached the maximum number of random emails. (100)',
        );
    } else {
        const randomEmail =
            (await db.query<[string[]]>(`SELECT * FROM rand::guid(12);`))[
                0
            ].result as string[];

        const emailExists = (await db.query<[{ id: string }[]]>(
            `SELECT id FROM account WHERE emails CONTAINS "${
                randomEmail[0]
            }";`,
        ))[0].result as { id: string }[];

        if (emailExists.length > 0) {
            await ctx.reply(
                '❌ An error occurred while generating the email address. Please try again.',
            );
            return;
        }

        await db.change(`account:${ctx.chat?.id}`, {
            emails: [...account.emails, randomEmail[0]],
        });
        await ctx.reply(
            `✅ New email address generated: ${randomEmail[0]}@${
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
                `${email}@${
                    Deno.env.get('EMAIL_DOMAIN') || 'decline.live'
                }`
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
        `✅ Email forwarding ${
            account.forward ? 'disabled' : 'enabled'
        }.`,
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
