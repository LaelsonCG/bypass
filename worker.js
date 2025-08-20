export default {
  async fetch(request) {
    const upgrade = request.headers.get("Upgrade");
    const connection = request.headers.get("Connection");

    if (upgrade?.toLowerCase().includes("websocket") &&
        connection?.toLowerCase().includes("upgrade")) {

      const [client, server] = new WebSocketPair();
      handleWebSocket(server, "ws://vip.clickhost.xyz");

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    return new Response("OK", { status: 200 });
  }
};

function handleWebSocket(wsClient, targetUrl) {
  // ✅ Aceita o WebSocket do cliente (lado do Worker)
  wsClient.accept();

  // ❌ Não chame .accept() aqui — é uma conexão de saída
  const wsServer = new WebSocket(targetUrl);

  // Encaminha mensagens: backend → cliente
  wsServer.addEventListener("message", (event) => {
    wsClient.send(event.data);
  });

  // Encaminha mensagens: cliente → backend
  wsClient.addEventListener("message", (event) => {
    wsServer.send(event.data);
  });

  // Fecha em cascata
  wsClient.addEventListener("close", () => {
    wsServer.close();
  });

  wsServer.addEventListener("close", () => {
    wsClient.close();
  });

  // Trata erro no backend
  wsServer.addEventListener("error", (err) => {
    console.error("Erro no backend:", err);
    wsClient.close(1011, "Erro no servidor de destino");
  });
}
