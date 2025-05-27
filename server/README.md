# WhaResponde - Bot de WhatsApp con Interfaz Gráfica

WhaResponde es una aplicación completa que permite la automatización de mensajes de WhatsApp a través de la API oficial de WhatsApp, incluyendo una interfaz gráfica para crear flujos automatizados y gestionar conversaciones.

## Características Principales

- Integración con la API oficial de WhatsApp
- Interfaz gráfica para crear flujos automatizados
- Sistema de gestión de contactos
- Sistema de campañas automatizadas
- Gestión de conversaciones
- Sistema de plantillas de mensajes
- Panel de administración
- Sistema de agentes
- Sistema de broadcast
- API REST para integraciones

## Estructura del Proyecto

```
├── client/                 # Frontend de la aplicación
│   ├── public/            # Archivos estáticos
│   └── src/               # Código fuente React
├── routes/                 # Rutas de la API
│   ├── user.js            # Rutas de usuarios
│   ├── web.js             # Rutas web
│   ├── admin.js           # Rutas de administración
│   └── ...                # Otras rutas
├── database/              # Configuración y modelos de base de datos
│   ├── config.js          # Configuración de la base de datos
│   └── models/            # Modelos de datos
├── helpers/               # Funciones auxiliares
├── middlewares/           # Middlewares de Express
├── functions/             # Funciones de utilidad
├── flow-json/            # Archivos de configuración de flujos
├── conversations/        # Gestión de conversaciones
├── loops/                # Lógica de campañas y bucles
├── sessions/             # Gestión de sesiones de WhatsApp
├── contacts/             # Gestión de contactos
├── socket/               # Configuración de WebSocket
├── languages/            # Archivos de internacionalización
└── emails/               # Plantillas de correo electrónico
```

## Personalización de Bots

### 1. Creación de Flujos Automatizados

Los flujos automatizados se configuran en el directorio `flow-json/`. Cada flujo es un archivo JSON que define:

```json
{
  "name": "Flujo de Bienvenida",
  "triggers": ["hola", "buenas"],
  "steps": [
    {
      "type": "message",
      "content": "¡Bienvenido! ¿En qué puedo ayudarte?",
      "options": ["Productos", "Servicios", "Contacto"]
    },
    {
      "type": "condition",
      "if": "option == 'Productos'",
      "then": "show_products",
      "else": "ask_again"
    }
  ]
}
```

### 2. Integración con Meta (WhatsApp Business API)

1. **Crear una cuenta de Meta Business**:
   - Visita [Meta Business](https://business.facebook.com)
   - Crea una cuenta de desarrollador
   - Configura tu aplicación en Meta for Developers

2. **Configuración en el proyecto**:
   ```javascript
   // config/meta.js
   module.exports = {
     appId: process.env.META_APP_ID,
     appSecret: process.env.META_APP_SECRET,
     phoneNumberId: process.env.META_PHONE_NUMBER_ID,
     businessAccountId: process.env.META_BUSINESS_ACCOUNT_ID
   };
   ```

3. **Verificación del webhook**:
   ```javascript
   // routes/webhook.js
   app.get('/webhook', (req, res) => {
     const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
     const mode = req.query['hub.mode'];
     const token = req.query['hub.verify_token'];
     const challenge = req.query['hub.challenge'];

     if (mode && token) {
       if (mode === 'subscribe' && token === VERIFY_TOKEN) {
         res.status(200).send(challenge);
       } else {
         res.sendStatus(403);
       }
     }
   });
   ```

## Creación de Nuevos Endpoints

### 1. Estructura Básica de un Endpoint

```javascript
// routes/custom.js
const express = require('express');
const router = express.Router();
const { validateToken } = require('../middlewares/auth');

// GET endpoint
router.get('/custom-endpoint', validateToken, async (req, res) => {
  try {
    // Tu lógica aquí
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST endpoint
router.post('/custom-endpoint', validateToken, async (req, res) => {
  try {
    const { data } = req.body;
    // Tu lógica aquí
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### 2. Registro del Endpoint

```javascript
// server.js
const customRoute = require('./routes/custom');
app.use('/api/custom', customRoute);
```

## Desarrollo de Interfaces Personalizadas

### 1. Consumo de la API desde React

```javascript
// Ejemplo de componente React
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CustomInterface = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/custom-endpoint', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setData(response.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Tu interfaz aquí */}
    </div>
  );
};
```

### 2. Ejemplo de Interfaz para Gestión de Flujos

```javascript
// components/FlowBuilder.js
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const FlowBuilder = () => {
  const [steps, setSteps] = useState([]);

  const onDragEnd = (result) => {
    // Lógica de reordenamiento
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="steps">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {steps.map((step, index) => (
              <Draggable key={step.id} draggableId={step.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {step.content}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
```

## Requisitos Previos

- Node.js (versión recomendada: 14.x o superior)
- MySQL
- Cuenta de WhatsApp Business API
- Cuenta de Meta Business
- Certificado SSL para producción

## Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
```
# Configuración del servidor
PORT=3010
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_base_datos

# JWT
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRATION=24h

# Meta/WhatsApp
META_APP_ID=tu_app_id
META_APP_SECRET=tu_app_secret
META_PHONE_NUMBER_ID=tu_phone_number_id
META_BUSINESS_ACCOUNT_ID=tu_business_account_id
VERIFY_TOKEN=tu_verify_token

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email
SMTP_PASS=tu_password
```

4. Iniciar el servidor:
```bash
npm start
```

## Tecnologías Principales

- **Backend**: 
  - Node.js, Express.js
  - Socket.IO para comunicación en tiempo real
  - JWT para autenticación
  - MySQL para base de datos
  - @whiskeysockets/baileys para WhatsApp

- **Frontend**:
  - React.js
  - Material-UI o Tailwind CSS
  - Redux o Context API para estado
  - Axios para peticiones HTTP
  - Socket.IO-client para WebSocket

## API Endpoints

### Autenticación
- `POST /api/user/register` - Registro de usuarios
- `POST /api/user/login` - Inicio de sesión
- `POST /api/user/refresh-token` - Renovación de token

### Gestión de Flujos
- `GET /api/chat_flow` - Listar flujos
- `POST /api/chat_flow` - Crear flujo
- `PUT /api/chat_flow/:id` - Actualizar flujo
- `DELETE /api/chat_flow/:id` - Eliminar flujo

### Gestión de Contactos
- `GET /api/phonebook` - Listar contactos
- `POST /api/phonebook` - Añadir contacto
- `PUT /api/phonebook/:id` - Actualizar contacto
- `DELETE /api/phonebook/:id` - Eliminar contacto

### Broadcast
- `POST /api/broadcast` - Enviar mensaje masivo
- `GET /api/broadcast/status/:id` - Estado del broadcast

### Webhook
- `POST /api/webhook` - Endpoint para recibir eventos de WhatsApp
- `GET /api/webhook` - Verificación del webhook

## Características de Seguridad

- Autenticación basada en JWT con refresh tokens
- Encriptación de contraseñas con bcrypt
- Validación de datos con express-validator
- Manejo seguro de sesiones
- Protección contra ataques CORS
- Rate limiting
- Sanitización de inputs
- Validación de tokens de Meta
- Encriptación de datos sensibles

## Mantenimiento y Soporte

### Desarrollo
- Nodemon para reinicio automático
- ESLint para linting
- Prettier para formateo de código
- Jest para testing

### Producción
- PM2 para gestión de procesos
- Nginx como proxy inverso
- SSL/TLS para conexiones seguras
- Logging con Winston
- Monitoreo con PM2 Plus

## Despliegue

1. **Preparación del servidor**:
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar la aplicación
pm2 start server.js --name wharesponde

# Configurar inicio automático
pm2 startup
pm2 save
```

2. **Configuración de Nginx**:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Licencia

ISC 