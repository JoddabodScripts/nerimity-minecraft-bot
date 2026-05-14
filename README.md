# Nerimity MC Server Bot

(yes this readme used the ASSISTANCE OF AI not fully ai)

Monitors Minecraft servers and shows their status in channels that auto-update.

## What it does

- Channel names update with server status (🟢 Online/🔴 Offline) and player count
- Each server can have its own list of monitored Minecraft servers
- Shows online players in the status channel
- Text commands for managing servers
- Only admins can add/remove servers

## Setup

1. Install deps:
```bash
npm install
```

2. Copy the example config:
```bash
cp config.json.example config.json
```

3. Get your Nerimity bot token from nerimity (I dont rememebr where) and put it in config.json

4. Invite the bot to your server with the invite link from the dev portal - give it admin perms

5. Run it:

`bash start.sh` (linux only if on window's then run `node bot.js` )

## Commands

**/addserver <host>**
Add a server to monitor. Example: `/addserver play.hypixel.net` or `/addserver mc.example.com:25566`
Only works if you're admin.

**/removeserver <name>**
Stop monitoring a server. You'll need to delete the channel yourself.

**/listservers**
Shows all servers you're monitoring.

## How it works

When you `/addserver` something, it creates a channel named like "mc-play.hypixel.net" and updates the name to show player count (e.g., "mc-play.hypixel.net • 254/500"). It also posts a message with the status.

The bot checks all servers every 100 seconds (change `pollInterval` in config if you want faster/slower updates).

## Config

```json
{
  "nerimityToken": "your-token-here",
  "pollInterval": 100000
}
```

Server configs get auto-saved to config.json when you add them.

## Notes

- Bot needs perms to create and edit channels
- Only admins can add/remove servers
- Uses Minecraft Server List Ping protocol to query servers
