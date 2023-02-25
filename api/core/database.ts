import Surreal from 'https://deno.land/x/surrealdb@v0.5.0/mod.ts';
import { Account } from '../types/bot.d.ts';

export class DB {
    public internal: Surreal;
    constructor() {
        const db = new Surreal('http://surldb:8000/rpc');
        this.internal = db;
    }

    async init({ user, pass }: { user: string; pass: string }): Promise<DB> {
        try {
            await this.internal.signin({
                user,
                pass,
            });

            await this.internal.use('groombot', 'mails');
            return this;
        } catch (error) {
            console.log(error);
            return this;
        }
    }

    async create<T extends Record<string, unknown>>(
        record: string,
        data: any,
    ): Promise<T> {
        return await this.internal.create<T>(record, data);
    }

    async change<
        T extends Record<string, unknown> = Account,
        U extends Record<string, unknown> = T,
    >(
        thing: string,
        data?: Partial<T> & U,
    ): Promise<(T & U & { id: string }) | (T & U & { id: string })[]> {
        return await this.internal.change<T, U>(thing, data);
    }

    async select<T = Account>(record: string): Promise<T[]> {
        return await this.internal.select<T>(record);
    }

    async first<T = Account>(record: string): Promise<T> {
        return (await this.internal.select<T>(record))[0];
    }

    async query(query: string) {
        return this.internal.query(query);
    }

    async delete(record: string) {
        return await this.internal.delete(record);
    }
}
