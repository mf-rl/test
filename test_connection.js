const { PubSub } = require('@google-cloud/pubsub');
const fs = require('fs');
const path = require('path');

// Cargar configuración
const configPath = path.join(__dirname, 'subscriptions.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const { projectId, subscriptions } = config;

const pubSub = new PubSub({ projectId });

function testSubscription(sub) {
  return new Promise((resolve, reject) => {
    const subscription = pubSub.subscription(sub.name, {
      flowControl: { maxMessages: 1 }
    });

    let finished = false;

    const timeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        cleanup();
        console.log(`✅ ${sub.code} (${sub.name})`);
        console.log('   Conexión OK (consumer-only, sin mensajes)');
        resolve();
      }
    }, 4000);

    function onMessage(message) {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);

      console.log(`✅ ${sub.code} (${sub.name})`);
      console.log(`   Conexión OK. Mensaje recibido (ID: ${message.id})`);

      // No afectar el flujo real
      message.nack();

      cleanup();
      resolve();
    }

    function onError(error) {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);

      console.error(`❌ ${sub.code} (${sub.name})`);
      console.error(`   Error: ${error.message}`);

      cleanup();
      reject(error);
    }

    function cleanup() {
      subscription.removeListener('message', onMessage);
      subscription.removeListener('error', onError);
    }

    subscription.on('message', onMessage);
    subscription.on('error', onError);
  });
}

async function run() {
  console.log('Iniciando prueba de conectividad Pub/Sub QA (consumer-only)...\n');

  for (const sub of subscriptions) {
    try {
      await testSubscription(sub);
    } catch {
      // Error ya logueado
    }
    console.log('----------------------------------');
  }

  console.log('\nPrueba finalizada.');
  process.exit(0);
}

run();
