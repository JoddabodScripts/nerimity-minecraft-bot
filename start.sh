#!/bin/bash
echo "Little bot!"
echo "============================"
bash ascii_art.sh
echo ""
echo "Checking configuration..."
if grep -q "YOUR_BOT_TOKEN_HERE" config.json; then
    echo "ERROR: Please edit config.json and add your Nerimity bot token!"
    exit 1
fi
echo "Configuration OK"
echo ""
echo "Starting bot..."
node bot.js
