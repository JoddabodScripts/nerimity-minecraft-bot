const { Client, Events } = require('@nerimity/nerimity.js');
const config = require('./config.json');

const client = new Client();

client.on(Events.Ready, () => {
  console.log('READY! Bot:', client.user?.username);
  console.log('Servers:');
  client.servers.cache.forEach((server, id) => {
    console.log('  -', server.name, '(ID:', id + ')');
  });
});

client.on(Events.MessageCreate, (message) => {
  console.log('Message from', message.user?.username, ':', message.content);
  console.log('  Server:', message.server?.name);
  console.log('  Channel:', message.channel?.name);
  
  if (message.content === '!test') {
    console.log('Replying to !test');
    message.reply('Test successful!').then(() => {
      console.log('Reply sent!');
    }).catch(err => {
      console.error('Reply failed:', err.message);
    });
  }
});

console.log('Logging in...');
client.login(config.nerimityToken).catch(err => {
  console.error('Login failed:', err.message);
});
