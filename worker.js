export default {
  async fetch(request, env, ctx) {
    // Verifica se é upgrade para WebSocket
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader && upgradeHeader.toLowerCase() === "websocket") {
      // Cria o par de WebSockets
      const [client, server] = new WebSocketPair();

      // Conecta o lado do server do par ao seu backend
      connectWebSocket(server, "ws://vip.clickhost.xyz:80");

      // Retorna o cliente para o navegador
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    // Resposta padrão para HTTP
    return new Response("WebSocket Proxy Ativo", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  },
};

// Função que conecta o WebSocket do Worker ao backend
async function connectWebSocket(wsClient, targetUrl) {
  // Aceita o WebSocket no lado do Worker
  wsClient.accept();

  // Conecta ao seu servidor real
  const wsServer = new WebSocket(targetUrl);

  // Quando conectar ao backend
  wsServer.addEventListener("open", () => {
    console.log("✅ Conectado ao backend:", targetUrl);
  });

  // Mensagem do backend → cliente
  wsServer.addEventListener("message", (event) => {
    wsClient.send(event.data);
  });

  // Mensagem do cliente → backend
  wsClient.addEventListener("message", (event) => {
    wsServer.send(event.data);
  });

  // Fechar em cascata
  wsClient.addEventListener("close", () => {
    wsServer.close();
  });

  wsServer.addEventListener("close", () => {
    wsClient.close();
  });

  // Tratar erro
  wsServer.addEventListener("error", (err) => {
    wsClient.close(1011, "Erro no backend");
  });
}
