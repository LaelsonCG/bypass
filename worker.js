export default {
  async fetch(request) {
    // pega a URL original
    let url = new URL(request.url);
    url.hostname = "vip.clickhost.xyz"; // seu host real que responde 101

    // só permite Upgrade websocket
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Esperando conexão WebSocket", { status: 400 });
    }

    // repassa sem mexer no body
    return fetch(new Request(url, request), {
      headers: {
        "Host": "vip.clickhost.xyz",
      }
    });
  }
}
