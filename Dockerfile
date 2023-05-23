FROM denoland/deno:1.33.4
EXPOSE 7000
WORKDIR /app

COPY deps.deno.ts .
RUN deno cache deps.deno.ts

ADD . .
RUN deno cache api/edge.ts --lock=deno.lock --lock-write

CMD ["task", "edge"]