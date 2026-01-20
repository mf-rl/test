const { PubSub } = require('@google-cloud/pubsub');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'subscriptions.json'), 'utf8')
);

const pubSubClient = new PubSub({
  projectId: config.projectId,
  keyFilename: path.join(__dirname, config.credentialsFile)
});

async function testSubscription(sub) {
  return new Promise((resolve) => {
    const subscription = pubSubClient.subscription(sub.name);

    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        subscription.removeAllListeners();
        console.log(`✅ ${sub.code} (${sub.name})`);
        resolve();
      }
    }, 2000);

    subscription.on('message', message => {
      message.nack(); // non-destructive
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        subscription.removeAllListeners();
        console.log(`✅ ${sub.code} (${sub.name})`);
        resolve();
      }
    });

    subscription.on('error', err => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        subscription.removeAllListeners();
        console.error(`❌ ${sub.code} (${sub.name})`);
        console.error(`   Error: ${err.message}`);
        resolve();
      }
    });
  });
}

(async () => {
  console.log('Iniciando prueba de conectividad Pub/Sub QA (consumer-only)...\n');

  for (const sub of config.subscriptions) {
    await testSubscription(sub);
    console.log('----------------------------------');
  }

  console.log('\nPrueba finalizada.');
})();
