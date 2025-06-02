const {SlashCommandBuilder, EmbedBuilder, CommandInteraction, Emoji}=require('discord.js');
const detectMessages = require('../detectMessages'); // ←修正

module.exports = {
	data: new SlashCommandBuilder()
		.setName('run')
		.setDescription('動作用のメッセージを送信します'),
    /**
     * スラッシュコマンド実行用関数
     * @param {CommandInteraction} interaction 
     * @returns 
     */
	async execute(interaction) {
        interaction.reply("Processed");
        /**@type {import('discord.js').Message} */
        let message = await interaction.channel.send(`このメッセージにリアクションをつけると観戦状態を切り替えることができます。`);
        detectMessages.push(message.id);
        message.react('👋');
	}
}