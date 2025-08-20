export default {
  async fetch(request) {
    // só aceita upgrade websocket
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Somente WebSocket", { status: 400 });
    }

    // URL real de destino (sua VPS/domínio que responde com 101)
    let url = new URL(request.url);
    url.protocol = "wss"; 
    url.hostname = "tls.clickhost.xyz"; // <- seu DNS que aponta pra VPS

    // repassa a conexão
    return fetch(url.toString(), request);
  }
}
