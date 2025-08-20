export default {
  async fetch(request, env, ctx) {
    // Verifica se é upgrade para WebSocket
    const upgrade = request.headers.get("Upgrade") || "";
    if (upgrade.toLowerCase().includes("websocket")) {
      // Encaminha para seu servidor WebSocket
      return fetch("http://vip.clickhost.xyz:80", {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
    }

    // Resposta para HTTP normal (opcional)
    return new Response("WebSocket Proxy Ativo", {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  },
};
