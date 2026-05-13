const { Client, Events } = require('@nerimity/nerimity.js');
const config = require('./config.json');

const client = new Client();

console.log('Available events:', Object.keys(Events));

client.on(Events.Ready, () => {
  console.log('Bot ready:', client.user?.username);
  
  client.updateCommands([
    { name: 'test', description: 'Test command' }
  ]).then(() => {
    console.log('Command registered');
  }).catch(err => {
    console.error('Register error:', err.message);
  });
});

// Listen for ALL events
const originalEmit = client.emit;
client.emit = function(event, ...args) {
  console.log('EVENT:', event, JSON.stringify(args[0] || {}).substring(0, 200));
  return originalEmit.call(this, event, ...args);
};

client.on(Events.InteractionCreate, (interaction) => {
  console.log('=== INTERACTION ===');
  console.log(JSON.stringify(interaction, null, 2).substring(0, 1000));
  console.log('================');
  
  if (interaction.commandName === 'test') {
    interaction.reply({ content: 'Test works!', ephemeral: true });
  }
});

client.login(config.nerimityToken).catch(err => {
  console.error('Login error:', err.message);
});
