const { PubSub } = require('@google-cloud/pubsub');
const fs = require('fs');
const path = require('path');

// Cargar configuración
const configPath = path.join(__dirname, 'subscriptions.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const { projectId, subscriptions } = config;

// Cliente Pub/Sub (usa GOOGLE_APPLICATION_CREDENTIALS)
const pubSubClient = new PubSub({ projectId });

console.log('Iniciando listeners Pub/Sub QA...\n');

subscriptions.forEach(sub => {
  const subscription = pubSubClient.subscription(sub.name, {
    flowControl: {
      maxMessages: 10
    }
  });

  subscription.on('message', message => {
    console.log('----------------------------------');
    console.log(`Integración: ${sub.code}`);
    console.log(`Suscripción: ${sub.name}`);
    console.log(`Mensaje ID: ${message.id}`);
    console.log(`Data: ${message.data.toString()}`);
    console.log('Attributes:', message.attributes);

    // Confirmar procesamiento
    message.ack();
  });

  subscription.on('error', error => {
    console.error('----------------------------------');
    console.error(`Error en integración ${sub.code}`);
    console.error(`Suscripción: ${sub.name}`);
    console.error(error.message);
  });

  console.log(`Escuchando ${sub.code} → ${sub.name}`);
});

console.log('\nEscuchando mensajes (Ctrl+C para salir)...');
