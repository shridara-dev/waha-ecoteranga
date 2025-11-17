const { bootstrap } = require('@waha/waha');

const config = {
  port: process.env.PORT || 3000,
  sessions: {
    start: {
      enabled: true
    }
  }
};

console.log('Démarrage WAHA pour EcoTeranga...');
console.log('WhatsApp HTTP API');
console.log(`Port: ${config.port}`);

bootstrap(config)
  .then(() => {
    console.log('WAHA démarré avec succès !');
    console.log(`Documentation: http://localhost:${config.port}/`);
  })
  .catch((error) => {
    console.error('Erreur:', error);
    process.exit(1);
  });

process.on('SIGTERM', () => {
  console.log('Arrêt WAHA...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Arrêt WAHA...');
  process.exit(0);
});
