const { Client, Events } = require('@nerimity/nerimity.js');
const config = require('./config.json');

const client = new Client();

client.on(Events.Ready, () => {
  console.log('Bot online:', client.user.username);
});

client.on(Events.MessageCreate, (message) => {
  console.log('=== MESSAGE OBJECT ===');
  console.log('Keys:', Object.keys(message));
  console.log('server:', message.server);
  console.log('channel:', message.channel);
  console.log('guild?', message.guild);
  
  // Try to find server ID from channel
  if (message.channel) {
    console.log('Channel keys:', Object.keys(message.channel));
    console.log('Channel serverId:', message.channel.serverId);
  }
  
  console.log('Full message (first 500 chars):');
  console.log(JSON.stringify(message, null, 2).substring(0, 500));
  console.log('==================');
});

client.login(config.nerimityToken);
