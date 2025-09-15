const WebSocket = require("ws");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const wss = new WebSocket.Server({ port: 3001 });

wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Mensaje recibido en backend:", data);
      const nuevoMensaje = await prisma.mensaje.create({
        data: {
          de: data.de,
          para: data.para,
          texto: data.texto,
        },
      });
      const mensajeParaEnviar = { ...nuevoMensaje };
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(mensajeParaEnviar));
        }
      });
    } catch (err) {
      console.error("Error procesando mensaje WebSocket:", err);
    }
  });
});

console.log("> WebSocket de chat listo en ws://localhost:3001");
