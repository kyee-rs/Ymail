import type {
    Context,
    Conversation,
    ConversationFlavor,
    SessionFlavor,
} from '../../deps.deno.ts';
import { ParseModeFlavor } from '../../deps.deno.ts';

export type MyContext =
    & Context
    & ConversationFlavor<Context>
    & SessionFlavor<Record<string, unknown>>
    & ParseModeFlavor<Context>;
export type MyConversation = Conversation<MyContext>;

export type Account = {
    id: string;
    emails: string[];
    forward: boolean;
};

export type WrappedQuery<T> = Array<{
    time: string;
    status: string;
    result: T[];
    code?: number;
    details?: string;
    description?: string;
    information?: string;
}>;
