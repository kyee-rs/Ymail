import {
    autoRetry,
    Bot,
    conversations,
    hydrateReply,
    session,
} from '../../deps.deno.ts';
import { MyContext } from '../types/bot.d.ts';
import { commands } from './cmd.ts';
import { deleteMenu } from '../handlers/menus.ts';

export const bot = new Bot<MyContext>(Deno.env.get('BOT_TOKEN')!, {
    client: {
        canUseWebhookReply: (method) => method === 'sendChatAction',
    },
});

bot.api.config.use(autoRetry());
bot.use(deleteMenu);
bot.use(hydrateReply<MyContext>);
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
bot.use(commands);

await bot.init();
