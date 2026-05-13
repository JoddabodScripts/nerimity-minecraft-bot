const { Client, Events } = require('@nerimity/nerimity.js');
const config = require('./config.json');

console.log('Starting diagnostic...');
console.log('Token (first 15 chars):', config.nerimityToken?.substring(0, 15) + '...');

const client = new Client();

// Override emit to log ALL events
const originalEmit = client.emit.bind(client);
client.emit = function(event, ...args) {
  console.log('[EMIT] Event:', event);
  if (args[0]) {
    const arg0 = args[0];
    console.log('  Data:', JSON.stringify({
      type: arg0.type,
      content: arg0.content?.substring(0, 50),
      username: arg0.user?.username,
      server: arg0.server?.name
    }));
  }
  return originalEmit(event, ...args);
};

client.on(Events.Ready, () => {
  console.log('\n✓ BOT READY!');
  console.log('Bot:', client.user?.username, '(ID:', client.user?.id + ')');
  console.log('Servers in cache:', client.servers.cache.size);
  
  if (client.servers.cache.size > 0) {
    console.log('\nServers:');
    client.servers.cache.forEach((server, id) => {
      console.log('  -', server.name, '(ID:', id + ')');
    });
  } else {
    console.log('\n⚠️  BOT IS NOT IN ANY SERVERS!');
    console.log('Invite the bot to your server first.');
  }
});

client.on(Events.MessageCreate, (message) => {
  console.log('\n✓ GOT MESSAGE!');
  console.log('From:', message.user?.username);
  console.log('Content:', message.content);
  console.log('Server:', message.server?.name);
  console.log('Channel:', message.channel?.name);
});

client.on('error', (err) => {
  console.error('Bot error:', err.message);
});

console.log('\nLogging in...');
client.login(config.nerimityToken).then(() => {
  console.log('Login promise resolved');
}).catch((err) => {
  console.error('Login failed:', err.message);
});
