const { Client, Events } = require('@nerimity/nerimity.js');
const config = require('./config.json');

const client = new Client();

console.log('Client methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client)));

client.on(Events.Ready, () => {
  console.log('Bot ready:', client.user?.username);
  console.log('updateCommands exists:', typeof client.updateCommands);
  console.log('commands exists:', typeof client.commands);
  
  if (client.updateCommands) {
    client.updateCommands([
      { name: 'test', description: 'Test command' }
    ]).then(() => {
      console.log('Commands registered via updateCommands');
    }).catch(err => {
      console.error('updateCommands failed:', err.message);
    });
  }
  
  if (client.commands) {
    console.log('commands object:', Object.keys(client.commands));
  }
});

client.on(Events.InteractionCreate, (interaction) => {
  console.log('Interaction received!');
  console.log('Type:', interaction.type);
  console.log('Keys:', Object.keys(interaction));
  console.log('Full interaction (first 500 chars):', JSON.stringify(interaction, null, 2).substring(0, 500));
});

client.login(config.nerimityToken);
