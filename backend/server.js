import app from "./app.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});

server.on("error", (error) => {
  console.error(`No se pudo iniciar el servidor: ${error.message}`);
  process.exit(1);
});
