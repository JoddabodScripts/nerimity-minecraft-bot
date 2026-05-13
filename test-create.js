const { Client, Events, ChannelTypes } = require('@nerimity/nerimity.js');
const config = require('./config.json');

const client = new Client();

client.on(Events.Ready, async () => {
  console.log('Bot online:', client.user.username);
  console.log('Servers:', client.servers.cache.size);
  
  const firstServer = client.servers.cache.first();
  if (!firstServer) {
    console.error('Bot is not in any servers!');
    process.exit(1);
  }
  
  console.log('Server:', firstServer.name, '(ID:', firstServer.id + ')');
  console.log('Server methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(firstServer)));
  console.log('Has createChannel?', typeof firstServer.createChannel);
    
  try {
    console.log('Creating channel...');
    const channel = await firstServer.createChannel({
      name: 'test-channel',
      type: ChannelTypes.SERVER_TEXT
    });
    console.log('SUCCESS! Channel:', channel.id, channel.name);
  } catch (error) {
    console.error('FAILED:', error.message);
    console.error('Stack:', error.stack);
  }
});

client.login(config.nerimityToken);
