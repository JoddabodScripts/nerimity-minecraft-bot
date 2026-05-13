const { Client, Events } = require('@nerimity/nerimity.js');
const config = require('./config.json');

const client = new Client();

client.on(Events.Ready, () => {
  console.log('Bot online:', client.user.username);
});

client.on(Events.MessageCreate, (msg) => {
  if (msg.user.id === client.user.id) return;
  
  console.log('\n=== FULL MESSAGE ===');
  console.log(JSON.stringify(msg, null, 2).substring(0, 2000));
  console.log('===================');
});

console.log('Logging in...');
client.login(config.nerimityToken);
