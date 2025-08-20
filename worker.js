export default {
  async fetch(request, env, ctx) {
    // Verifica se é uma requisição WebSocket
    const upgradeHeader = request.headers.get("Upgrade");
    if (!upgradeHeader || !upgradeHeader.toLowerCase().includes("Websocket")) {
      return new Response("WebSocket Proxy Ativo", {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    }

    // Cria o par de WebSockets
    const [client, server] = Object.values(new WebSocketPair());

    // Conecta o lado do server do par ao seu backend
    handleWebSocket(server, "ws://vip.clickhost.xyz:80");

    // Responde com upgrade para WebSocket (101)
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  },
};

async function handleWebSocket(webSocket, targetUrl) {
  webSocket.accept();

  const backConn = new WebSocket(targetUrl);

  backConn.addEventListener("open", () => {
    console.log("✅ Conectado ao backend:", targetUrl);
  });

  backConn.addEventListener("message", (event) => {
    webSocket.send(event.data);
  });

  webSocket.addEventListener("message", (event) => {
    backConn.send(event.data);
  });

  webSocket.addEventListener("close", () => {
    backConn.close();
  });

  backConn.addEventListener("close", () => {
    webSocket.close();
  });

  backConn.addEventListener("error", (err) => {
    webSocket.close(1011, "Erro no backend");
  });
}
