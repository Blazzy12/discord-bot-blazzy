const { Events, Collection } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		// Ignore bots and messages without the prefix
		if (message.author.bot) return;

		const prefix = ','; // Change this to your desired prefix
		if (!message.content.startsWith(prefix)) return;

		// Parse command and arguments
		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const commandName = args.shift().toLowerCase();

		// Get command from text commands collection
		const command = message.client.textCommands.get(commandName);

		if (!command) {
			// Optionally handle unknown commands silently or with a message
			return;
		}

		const { cooldowns } = message.client;

		if (!cooldowns.has(command.data.name)) {
			cooldowns.set(command.data.name, new Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get(command.data.name);
		const defaultCooldownDuration = 3;
		const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
			if (now < expirationTime) {
				const expiredTimestamp = Math.round(expirationTime / 1_000);
				return message.reply(`Please wait, you are on a cooldown for \`${command.name}\`. You can use it again <t:${expiredTimestamp}:R>.`);
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		try {
			await command.execute(message, args);
		} catch (error) {
			console.error(error);
			await message.reply('There was an error while executing this command!');
		}
	},
};
