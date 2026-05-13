const { Client, Events } = require('@nerimity/nerimity.js');
const { status } = require('minecraft-server-util');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');
let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

if (!config.servers) config.servers = {};
if (!config.pollInterval) config.pollInterval = 30000;

const client = new Client();

async function checkMinecraftServer(host, port) {
  const actualPort = port || 25565;
  try {
    const result = await status(host, actualPort, { timeout: 5000, enableSRV: true });
    return {
      online: true, host, port: actualPort,
      players: result.players, version: result.version
    };
  } catch (error) {
    return {
      online: false, host, port: actualPort,
      players: { online: 0, max: 0 }, error: error.message
    };
  }
}

async function updateChannelStatus(serverConfig) {
  const serverStatus = await checkMinecraftServer(serverConfig.host, serverConfig.port);
  const channelName = serverConfig.name + ' • ' + 
    (serverStatus.online ? serverStatus.players.online + '/' + serverStatus.players.max : 'Offline');
  
  try {
    console.log('Updating channel:', serverConfig.channelId, '| New name:', channelName);
    
    await axios.post(
      `https://nerimity.com/api/servers/${serverConfig.serverId}/channels/${serverConfig.channelId}`,
      { name: channelName },
      { 
        headers: { 
          'Authorization': config.nerimityToken, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
    const statusMsg = serverStatus.online 
      ? '🟢 **' + serverConfig.host + '**\nPlayers: ' + serverStatus.players.online + '/' + serverStatus.players.max
      : '🔴 **Server Offline**';
    
    if (serverConfig.messageId) {
      try {
        await axios.patch(
          `https://nerimity.com/api/channels/${serverConfig.channelId}/messages/${serverConfig.messageId}`,
          { content: statusMsg },
          { headers: { 'Authorization': config.nerimityToken, 'Content-Type': 'application/json' } }
        );
      } catch (e) {
        console.log('Message update failed, creating new...');
        const response = await axios.post(
          `https://nerimity.com/api/channels/${serverConfig.channelId}/messages`,
          { content: statusMsg },
          { headers: { 'Authorization': config.nerimityToken, 'Content-Type': 'application/json' } }
        );
        serverConfig.messageId = response.data.id;
        saveConfig();
      }
    } else {
      const response = await axios.post(
        `https://nerimity.com/api/channels/${serverConfig.channelId}/messages`,
        { content: statusMsg },
        { headers: { 'Authorization': config.nerimityToken, 'Content-Type': 'application/json' } }
      );
      serverConfig.messageId = response.data.id;
      saveConfig();
    }
    
    console.log('✓ Updated:', serverConfig.name, '|', serverStatus.online ? '🟢' : '🔴', 
      serverStatus.players.online + '/' + serverStatus.players.max);
  } catch (error) {
    console.error('Error updating channel:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

function saveConfig() {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

async function pollServers() {
  console.log('\n[POLLING] Checking all servers...');
  for (const serverId in config.servers) {
    const servers = config.servers[serverId];
    if (!Array.isArray(servers)) continue;
    for (const server of servers) {
      if (server.channelId) {
        await updateChannelStatus(server);
      }
    }
  }
}

client.on(Events.Ready, () => {
  console.log('✓ Bot online:', client.user.username);
  console.log('✓ In servers:', client.servers.cache.size);
  console.log('✓ Poll interval:', config.pollInterval / 1000, 'seconds');
  console.log('✓ Monitored servers:', Object.keys(config.servers).length);
  
  pollServers();
  setInterval(pollServers, config.pollInterval);
});

client.on(Events.MessageCreate, async (msg) => {
  if (msg.user.id === client.user.id) return;
  
  const content = msg.content.trim();
  console.log('[MSG]', content);
  
  const serverId = msg.serverId || msg.channel?.serverId;
  if (!serverId) return;
  
  if (content === '/ping') {
    msg.reply('Pong!');
    return;
  }
  
  if (content.startsWith('/addserver ')) {
    console.log('Processing addserver...');
    const hostInput = content.split(' ')[1];
    if (!hostInput) { msg.reply('Usage: /addserver <host>[:port]'); return; }
    
    const [hostname, portStr] = hostInput.includes(':') ? [hostInput.split(':')[0], hostInput.split(':')[1]] : [hostInput, '25565'];
    const port = parseInt(portStr);
    const name = hostname;
    
    if (!config.servers[serverId]) config.servers[serverId] = [];
    const servers = config.servers[serverId];
    
    if (servers.find(s => s.name === name)) {
      msg.reply('Server already monitored!');
      return;
    }
    
    try {
      console.log('Creating channel via API...');
      const response = await axios.post(
        `https://nerimity.com/api/servers/${serverId}/channels`,
        { name: 'mc-' + name, type: 1 },
        { headers: { 'Authorization': config.nerimityToken, 'Content-Type': 'application/json' } }
      );
      
      const channelId = response.data.id;
      console.log('✓ Channel created:', channelId);
      msg.reply('✓ Channel created! Checking server...');
      
      const newServer = {
        name, host: hostname, port: port, 
        channelId, messageId: null,
        serverId
      };
      servers.push(newServer);
      saveConfig();
      
      await updateChannelStatus(newServer);
      
    } catch (error) {
      console.error('Error:', error.message);
      console.error('Response:', error.response?.data);
      msg.reply('Error: ' + (error.response?.data?.message || error.message));
    }
  }
  
  if (content.startsWith('/removeserver ')) {
    console.log('Processing removeserver...');
    const name = content.split(' ')[1];
    if (!name) { msg.reply('Usage: /removeserver <name>'); return; }
    
    if (!config.servers[serverId]) config.servers[serverId] = [];
    const servers = config.servers[serverId];
    const serverIndex = servers.findIndex(s => s.name === name);
    
    if (serverIndex === -1) {
      msg.reply('Server not found!');
      return;
    }
    
    const server = servers[serverIndex];
    const channelId = server.channelId;
    
    servers.splice(serverIndex, 1);
    saveConfig();
    
    msg.reply('✓ Server "' + name + '" removed from monitoring!\nPlease manually delete the channel: ' + (channelId || 'unknown'));
  }
  
  if (content === '/listservers') {
    const servers = config.servers[serverId] || [];
    if (servers.length === 0) { msg.reply('No servers monitored!'); return; }
    let msg_text = '**Monitored Servers:**\n';
    servers.forEach(s => { msg_text += '• ' + s.name + ' (' + s.host + ':' + s.port + ')\n'; });
    msg.reply(msg_text);
  }
});

console.log('Logging in...');
client.login(config.nerimityToken);
