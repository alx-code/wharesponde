require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload");
// const { initializeSocket } = require("./socket.js");
const { runCampaign } = require("./loops/campaignLoop.js");
const nodeCleanup = require("node-cleanup");
const { init, cleanup } = require("./helper/addon/qr");
const path = require("path");
const currentDir = process.cwd();

// Middleware para loggear peticiones - Añadido para depurar
app.use((req, res, next) => {
  console.log(`[Backend Request] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// routers
const userRoute = require("./routes/user");
app.use("/api/user", userRoute);

const webRoute = require("./routes/web");
app.use("/api/web", webRoute);

const adminRoute = require("./routes/admin");
app.use("/api/admin", adminRoute);

const phonebookRoute = require("./routes/phonebook");
app.use("/api/phonebook", phonebookRoute);

const chat_flowRoute = require("./routes/chatFlow");
app.use("/api/chat_flow", chat_flowRoute);

const inboxRoute = require("./routes/inbox");
app.use("/api/inbox", inboxRoute);

const templetRoute = require("./routes/templet");
app.use("/api/templet", templetRoute);

const chatbotRoute = require("./routes/chatbot");
app.use("/api/chatbot", chatbotRoute);

const broadcastRoute = require("./routes/broadcast");
app.use("/api/broadcast", broadcastRoute);

const apiRoute = require("./routes/apiv2");
app.use("/api/v1", apiRoute);

const agentRoute = require("./routes/agent");
app.use("/api/agent", agentRoute);

const qrRoute = require("./routes/qr");
app.use("/api/qr", qrRoute);

// Servir archivos estáticos - Asegúrate de que esta línea esté DESPUÉS de todas tus rutas /api
app.use(express.static(path.resolve(currentDir, "./client/public")));

// Rutas para servir la landing page y la aplicación React - Asegúrate de que estas estén DESPUÉS de express.static y rutas /api
app.get("/", (req, res) => {
  res.sendFile(path.resolve(currentDir, "./client/public", "landing.html"));
});

app.get("/app/*", (req, res) => {
  res.sendFile(path.resolve(currentDir, "./client/public", "index.html"));
});

// Ruta catch-all para servir el index.html (para react-router, etc.) - Asegúrate de que esta sea la ÚLTIMA ruta
app.get("*", function (request, response) {
  response.sendFile(path.resolve(currentDir, "./client/public", "index.html"));
});

const server = app.listen(process.env.PORT || 3010, () => {
  console.log(`WaCrm server is running on port ${process.env.PORT || 3010}`);
  init();
  setTimeout(() => {
    runCampaign();
  }, 1000);
});

// Initialize Socket.IO after server is running
const io = require("./socket").initializeSocket(server);
module.exports = io;

nodeCleanup(cleanup);
