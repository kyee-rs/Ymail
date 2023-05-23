import { Application, run } from '../deps.deno.ts';
import { bot } from './core/bot.ts';
import { messageListener } from './handlers/email.ts';

await bot.api.deleteWebhook();

console.log(`🦄 Initialized as @${bot.botInfo.username}`);
const runner = run(bot, {
    sink: {
        concurrency: 300,
    },
});
await new Application()
    .use(messageListener.routes())
    .listen({ port: parseInt(Deno.env.get('PORT')!) || 7000 });

const stopRunner = () => runner.isRunning() && runner.stop();

Deno.addSignalListener('SIGINT', stopRunner);
Deno.addSignalListener('SIGTERM', stopRunner);
