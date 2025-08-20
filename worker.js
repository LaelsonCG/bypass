export default {
  async fetch(request) {
    // URL de destino real (seu domínio que resolve para a VPS)
    let url = new URL(request.url);
    url.hostname = "vip.clickhost.xyz";
    url.protocol = "wss"; // ou "wss" se for websocket seguro

    // Clona o request original
    let newRequest = new Request(url, request);

    // Encaminha como WebSocket
    return fetch(newRequest, {
      headers: {
        "Host": "vip.clickhost.xyz",
        "Upgrade": "websocket",
        "Connection": "Upgrade"
      }
    });
  }
}
