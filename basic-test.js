const { Client, Events } = require('@nerimity/nerimity.js');
const config = require('./config.json');

const client = new Client();

// Log when bot is ready
client.on(Events.Ready, () => {
  console.log('✓ BOT IS READY!');
  console.log('Bot username:', client.user?.username);
  console.log('Bot ID:', client.user?.id);
  console.log('Number of servers:', client.servers.cache.size);
  
  if (client.servers.cache.size > 0) {
    console.log('Servers:');
    client.servers.cache.forEach((server, id) => {
      console.log('  -', server.name, '(ID:', id + ')');
    });
  } else {
    console.log('⚠ Bot is not in any servers! Invite it first.');
  }
});

// Listen for ANY event using the underlying EventEmitter
const allEvents = [
  'ready',
  'messageCreate', 
  'messageUpdate',
  'messageDelete',
  'serverJoined',
  'serverLeft',
  'serverChannelCreated',
  'serverChannelUpdated',
  'serverChannelDeleted'
];

allEvents.forEach(eventName => {
  client.on(eventName, (...args) => {
    console.log('[EVENT:', eventName + ']', JSON.stringify(args[0] || {}).substring(0, 300));
  });
});

// Also add a raw event listener if possible
if (client.socket) {
  console.log('Socket exists, adding raw listener');
  client.socket.on('message', (data) => {
    console.log('[SOCKET]', data.substring(0, 200));
  });
}

console.log('Attempting to login...');
console.log('Token (first 10 chars):', config.nerimityToken?.substring(0, 10) + '...');

client.login(config.nerimityToken).then(() => {
  console.log('Login promise resolved');
}).catch((err) => {
  console.error('Login failed:', err.message);
});
