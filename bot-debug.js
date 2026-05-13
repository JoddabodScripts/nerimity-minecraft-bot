const { Client, Events, ChannelTypes } = require('@nerimity/nerimity.js');
const config = require('./config.json');

const client = new Client();

client.on(Events.Ready, () => {
  console.log('Bot connected as:', client.user?.username);
  console.log('Bot ID:', client.user?.id);
  console.log('Servers in cache:', client.servers.cache.size);
  client.servers.cache.forEach((server, id) => {
    console.log('  - Server:', server.name, '(ID:', id + ')');
  });
});

client.on(Events.MessageCreate, (message) => {
  console.log('=== MESSAGE RECEIVED ===');
  console.log('From:', message.user?.username);
  console.log('Content:', message.content);
  console.log('Server:', message.server?.name, '(ID:', message.server?.id + ')');
  console.log('Channel:', message.channel?.name);
  console.log('Member permissions:', message.member?.permissions);
  console.log('Is bot message:', message.user?.bot);
  console.log('Bot ID check:', message.user?.id === client.user?.id);
  console.log('========================');
});

client.login(config.nerimityToken).catch(err => {
  console.error('Login error:', err.message);
});
