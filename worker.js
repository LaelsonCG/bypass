export default {
  async fetch(request) {
    // Extrai os headers com fallback para string vazia
    const upgrade = (request.headers.get("Upgrade") || "").toLowerCase();
    const connection = (request.headers.get("Connection") || "").toLowerCase();

    // Verifica se é uma requisição WebSocket (flexível)
    const isUpgrade = upgrade.includes("websocket");
    const hasConnectionUpgrade = connection.includes("upgrade");

    if (isUpgrade && hasConnectionUpgrade) {
      // Cria o par de WebSockets
      const [client, server] = new WebSocketPair();

      // Conecta ao backend
      connectToBackend(server, "ws://vip.clickhost.xyz");

      // Retorna 101 Switching Protocols
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    // Resposta padrão (HTTP 200)
    return new Response("OK", { status: 200 });
  },
};

// Função que conecta o WebSocket do Worker ao backend
function connectToBackend(wsClient, targetUrl) {
  // Aceita o WebSocket no lado do Worker
  wsClient.accept();

  // Cria conexão com o backend real
  const wsServer = new WebSocket(targetUrl);

  // Encaminha mensagens: backend → cliente
  wsServer.addEventListener("message", (event) => {
    if (event.data) wsClient.send(event.data);
  });

  // Encaminha mensagens: cliente → backend
  wsClient.addEventListener("message", (event) => {
    if (event.data) wsServer.send(event.data);
  });

  // Fechar em cascata
  wsClient.addEventListener("close", () => {
    wsServer.close();
  });

  wsServer.addEventListener("close", () => {
    wsClient.close();
  });

  // Tratar erro no backend
  wsServer.addEventListener("error", (err) => {
    console.error("Backend error:", err);
    wsClient.close(1011, "Erro no servidor de destino");
  });
}
