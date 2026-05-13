const { Client, Events } = require('@nerimity/nerimity.js');
const config = require('./config.json');

const client = new Client();

// Log ALL events
const originalOn = client.on.bind(client);
client.on = function(event, handler) {
  const wrappedHandler = function(...args) {
    console.log('[EVENT]', event, JSON.stringify(args[0] || {}).substring(0, 200));
    return handler.apply(this, args);
  };
  return originalOn(event, wrappedHandler);
};

// Re-register the events after wrapping
client.on(Events.Ready, () => {
  console.log('READY! Bot:', client.user?.username);
  console.log('Servers:', client.servers.cache.size);
  client.servers.cache.forEach((s, id) => console.log('  -', s.name, id));
});

client.on(Events.MessageCreate, (msg) => {
  console.log('[MSG]', msg.user?.username, ':', msg.content, '| Server:', msg.server?.name);
});

console.log('Logging in...');
client.login(config.nerimityToken).catch(e => console.error('Login error:', e.message));
