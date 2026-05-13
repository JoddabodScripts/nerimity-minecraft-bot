const { Client, Events, ChannelTypes } = require('@nerimity/nerimity.js');
const { status } = require('minecraft-server-util');

const config = require('./config.json');
const client = new Client();

client.on(Events.Ready, () => {
  console.log('✓ Bot online:', client.user.username);
  console.log('✓ In servers:', client.servers.cache.size);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.user.id === client.user.id) return;
  
  console.log('[MSG]', message.content);
  console.log('Message keys:', Object.keys(message));
  
  // Get server ID from channel
  const channel = message.channel;
  console.log('Channel:', channel?.name);
  console.log('Channel keys:', Object.keys(channel || {}));
  
  const serverId = channel?.serverId || message.serverId;
  console.log('Server ID:', serverId);
  
  if (!serverId) {
    console.log('No server ID found!');
    return;
  }
  
  if (message.content === '!ping') {
    message.reply('Pong!');
    return;
  }
  
  if (message.content.startsWith('!addserver ')) {
    console.log('Processing addserver...');
    const host = message.content.split(' ')[1];
    if (!host) { message.reply('Usage: !addserver <host>'); return; }
    
    try {
      const server = client.servers.cache.get(serverId);
      if (!server) {
        console.error('Server not found in cache!');
        message.reply('Error: Server not found');
        return;
      }
      
      console.log('Found server:', server.name);
      console.log('Creating channel...');
      
      const channel = await server.createChannel({
        name: 'mc-' + host,
        type: ChannelTypes.SERVER_TEXT
      });
      
      console.log('Channel created:', channel.id);
      message.reply('✓ Channel created: ' + channel.name);
      
      // Check MC server
      const result = await status(host, 25565, { timeout: 5000 });
      const msg = '🟢 ' + host + ' | Players: ' + result.players.online + '/' + result.players.max;
      await channel.send(msg);
      
      console.log('✓ Done!');
    } catch (error) {
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      message.reply('Error: ' + error.message);
    }
  }
});

console.log('Logging in...');
client.login(config.nerimityToken);
