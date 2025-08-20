export default {
  async fetch(request) {
    const upgrade = request.headers.get("Upgrade");
    const connection = request.headers.get("Connection");

    if (upgrade?.toLowerCase().includes("websocket") &&
        connection?.toLowerCase().includes("upgrade")) {

      // ✅ Agora sim, WebSocketPair funciona
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

function handleWebSocket(ws, targetUrl) {
  ws.accept();

  const backConn = new WebSocket(targetUrl);
  backConn.accept();

  backConn.addEventListener("message", (event) => ws.send(event.data));
  ws.addEventListener("message", (event) => backConn.send(event.data));

  backConn.addEventListener("close", () => ws.close());
  ws.addEventListener("close", () => backConn.close());

  backConn.addEventListener("error", () => ws.close(1011));
}
