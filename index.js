// Run this before anything else
require('./deploy-commands.js');

// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({
  	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember],
});

client.commands = new Collection();
client.textCommands = new Collection();
client.cooldowns = new Collection();
client.selectMenus = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const commandModule = require(filePath);

		// Check if the module exports an array of commands
		if (Array.isArray(commandModule)) {
			for (const command of commandModule) {
				if ('data' in command && 'execute' in command) {
					client.commands.set(command.data.name, command);
					// Also add to text commands if enabled
					if (command.textEnabled) {
						client.textCommands.set(command.data.name, command);
					}
				} else {
					console.log(`[WARNING] A command in array at ${filePath} is missing a required "data" or "execute" property.`);
				}
			}
		}
		// Handle single command export (original behavior)
		else if ('data' in commandModule && 'execute' in commandModule) {
			client.commands.set(commandModule.data.name, commandModule);
			// Also add to text commands if enabled
			if (commandModule.textEnabled) {
				client.textCommands.set(commandModule.data.name, commandModule);
			}
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Load select menus
const selectMenusPath = path.join(__dirname, 'selectMenus');
const selectMenuFiles = fs.readdirSync(selectMenusPath).filter(file => file.endsWith('.js'));

for (const file of selectMenuFiles) {
	const filePath = path.join(selectMenusPath, file);
	const selectMenu = require(filePath);
	if ('data' in selectMenu && 'execute' in selectMenu) {
    	client.selectMenus.set(selectMenu.data.name, selectMenu);
	}
}

// Log in to Discord with your client's token
client.login(token);