const { Client, Events } = require('@nerimity/nerimity.js');
const config = require('./config.json');

const client = new Client();

client.on(Events.Ready, () => {
  console.log('✓ Bot connected as ' + client.user?.username);
  console.log('Bot ID: ' + client.user?.id);
  console.log('Servers: ' + client.servers.cache.size);
});

client.on(Events.MessageCreate, (message) => {
  console.log('=== GOT MESSAGE ===');
  console.log('From: ' + message.user?.username);
  console.log('Content: ' + message.content);
  console.log('Server: ' + message.server?.name);
  console.log('Channel: ' + message.channel?.name);
  console.log('Bot message? ' + (message.user?.id === client.user?.id));
  console.log('===================');
  
  if (message.user.id === client.user.id) return;
  
  if (message.content === '!ping') {
    console.log('Replying to !ping');
    message.reply('Pong!').catch(err => {
      console.error('Reply failed:', err.message);
    });
  }
  
  if (message.content.startsWith('!')) {
    console.log('Command detected: ' + message.content);
  }
});

console.log('Logging in...');
client.login(config.nerimityToken).catch(err => {
  console.error('Login error:', err.message);
});
