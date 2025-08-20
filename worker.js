export default {
  async fetch(request) {
    // Verifica os headers de upgrade (ignora case)
    const upgrade = request.headers.get("Upgrade");
    const connection = request.headers.get("Connection");

    if (upgrade?.toLowerCase().includes("websocket") && 
        connection?.toLowerCase().includes("upgrade")) {

      // Cria o par de WebSockets
      const [client, server] = new WebSocketPair();

      // Conecta o server do par ao seu backend
      this.handleBackend(server, "ws://vip.clickhost.xyz");

      // Retorna o WebSocket para o cliente (101)
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    // Resposta padrão
    return new Response("OK", { status: 200 });
  },

  async handleBackend(clientWs, targetUrl) {
    // Aceita o WebSocket no lado do Worker
    clientWs.accept();

    // Conecta ao backend real
    const serverWs = new WebSocket(targetUrl);
    serverWs.accept();

    // Bi-direcional: cliente ↔ backend
    clientWs.addEventListener("message", (e) => serverWs.send(e.data));
    serverWs.addEventListener("message", (e) => clientWs.send(e.data));

    // Fechar em cascata
    clientWs.addEventListener("close", () => serverWs.close());
    serverWs.addEventListener("close", () => clientWs.close());

    // Erro
    serverWs.addEventListener("error", () => clientWs.close(1011));
  },
};
