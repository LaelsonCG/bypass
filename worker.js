import { connect } from 'cloudflare:sockets';

const targetHost = 'wss://vip.clickhost.xyz'; // URL WebSocket do servidor
const targetPort = 80; // Porta do WSS, caso seja necessária.

const createWebSocketStream = (webSocket) => {
  return new ReadableStream({
    start(controller) {
      webSocket.addEventListener('message', (e) => controller.enqueue(e.data));
      webSocket.addEventListener('close', () => controller.close());
      webSocket.addEventListener('error', (e) => {
        console.error('WebSocket error:', e.message);
        controller.error(e);
      });
    },
    cancel() {
      if (webSocket.readyState === WebSocket.OPEN) {
        webSocket.close();
      }
    },
  });
};

const handleWebSocketStream = (targetWebSocket) => {
  return new WritableStream({
    async write(chunk) {
      if (targetWebSocket.readyState === WebSocket.OPEN) {
        targetWebSocket.send(chunk);
      } else {
        console.warn('Attempted to send data on closed WebSocket');
      }
    },
    close() {
      if (targetWebSocket.readyState === WebSocket.OPEN) {
        targetWebSocket.close();
      }
    },
    abort(reason) {
      console.error('WebSocket connection aborted:', reason);
      if (targetWebSocket.readyState === WebSocket.OPEN) {
        targetWebSocket.close();
      }
    },
  });
};

export default {
  async fetch(request) {
    const webSocketPair = new WebSocketPair();
    const [clientWebSocket, proxyWebSocket] = Object.values(webSocketPair);
    proxyWebSocket.accept();

    try {
      console.log(`Connecting to WebSocket ${targetHost}:${targetPort}...`);
      const targetWebSocket = new WebSocket(`${targetHost}:${targetPort}`);
      
      targetWebSocket.onopen = () => {
        console.log('WebSocket connection established.');

        const webSocketStream = createWebSocketStream(proxyWebSocket);
        webSocketStream
          .pipeTo(handleWebSocketStream(targetWebSocket))
          .catch((error) => {
            console.error('WebSocket to WebSocket pipe error:', error?.message);
            if (proxyWebSocket.readyState === WebSocket.OPEN) {
              proxyWebSocket.close();
            }
          });

        const targetWebSocketStream = createWebSocketStream(targetWebSocket);
        targetWebSocketStream
          .pipeTo(handleWebSocketStream(proxyWebSocket))
          .catch((error) => {
            console.error('WebSocket to WebSocket pipe error:', error);
            if (proxyWebSocket.readyState === WebSocket.OPEN) {
              proxyWebSocket.close();
            }
          });
      };

      return new Response(null, { status: 101, webSocket: clientWebSocket });
    } catch (error) {
      console.error('Connection error:', error);
      if (clientWebSocket.readyState === WebSocket.OPEN) {
        clientWebSocket.close();
      }
      if (proxyWebSocket.readyState === WebSocket.OPEN) {
        proxyWebSocket.close();
      }
      return new Response('Connection error', { status: 500 });
    }
  },
};
