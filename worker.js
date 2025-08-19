export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Se for uma requisição WebSocket (Upgrade: websocket)
    if (request.headers.get("Upgrade") === "websocket") {
      // Redireciona para o backend WebSocket
      const targetUrl = "ws://vip.clickhost.xyz:80";

      // Faz o proxy direto com fetch
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      // Retorna a resposta com o WebSocket
      return new Response(response.body, {
        status: response.status,
        headers: response.headers,
      });
    }

    // Para requisições HTTP normais (ex: navegação no navegador)
    return new Response("WebSocket Proxy Ativo", {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  },
};
