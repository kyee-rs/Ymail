import Surreal from 'https://deno.land/x/surrealdb@v0.7.3/mod.ts';

export const db = new Surreal('http://surldb:8000/rpc');

db.signin({
    user: Deno.env.get('SURREAL_USER') || 'root',
    pass: Deno.env.get('SURREAL_PASS') || 'root',
});

db.use(
    Deno.env.get('SURREAL_NAMESPACE') || 'root',
    Deno.env.get('SURREAL_DATABASE') || 'root',
);
