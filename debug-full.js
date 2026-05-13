const { Client, Events } = require('@nerimity/nerimity.js');
const config = require('./config.json');

const client = new Client();

client.on(Events.Ready, () => {
  console.log('Bot online:', client.user.username);
});

client.on(Events.MessageCreate, (message) => {
  console.log('=== FULL MESSAGE OBJECT ===');
  console.log(JSON.stringify(message, null, 2));
  console.log('========================');
});

client.login(config.nerimityToken);
