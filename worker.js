export default {
  async fetch(request, env) {
    // Só aceita upgrade
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Somente WebSocket", { status: 400 });
    }

    // cria par de sockets
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();

    // abre conexão até seu destino
    const upstreamResponse = await fetch("wss://vip.clickhost.xyz", request);

    if (!upstreamResponse.webSocket) {
      server.close(1011, "Falha ao conectar ao destino");
      return new Response("Erro ao abrir WS", { status: 500 });
    }

    const upstream = upstreamResponse.webSocket;
    upstream.accept();

    // pipe client → upstream
    server.addEventListener("message", (e) => upstream.send(e.data));
    server.addEventListener("close", () => upstream.close());
    server.addEventListener("error", () => upstream.close());

    // pipe upstream → client
    upstream.addEventListener("message", (e) => server.send(e.data));
    upstream.addEventListener("close", () => server.close());
    upstream.addEventListener("error", () => server.close());

    // devolve pro cliente
    return new Response(null, { status: 101, webSocket: client });
  },
};
