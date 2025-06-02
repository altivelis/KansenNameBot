const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js'); //discord.js からClientとIntentsを読み込む
const {token,guildId} = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildExpressions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ]
});  //clientインスタンスを作成する

const commands = {};

const commandsPath = path.join(__dirname,'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if('data' in command && 'execute' in command){
        commands[command.data.name] = command;
    }else{
        console.log(`[WARNING] The command at ${filePath} is missing a required \"data\" or \"execute\" property.`);
    }
}

client.once(Events.ClientReady, async () => {
    const data = []
    for (const commandName in commands) {
        data.push(commands[commandName].data)
    }
    await client.application.commands.set(data/*, guildId*/);
    
    console.log("Ready!");
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    const command = commands[interaction.commandName];
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
        })
    }
});

const detectMessages = require('./detectMessages');

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    console.log("Reaction added");
    if(detectMessages.includes(reaction.message.id) && !user.bot){
        const member = await reaction.message.guild.members.fetch(user.id);
        if(!member) return;
        
        // 既存のニックネームを取得
        const existingNickname = member.nickname || member.user.username;
        // すでに「観戦」が含まれている場合は観戦を消す
        if (existingNickname.startsWith("観戦")) {
            // 「観戦」を削除
            const newNickname = existingNickname.replace("観戦", "");
            // ニックネームを更新
            await member.setNickname(newNickname).catch(console.error);
            // リアクションを削除
            await reaction.users.remove(user.id).catch(console.error);
            return;
        }else{
            // 「観戦」を追加
            const newNickname = "観戦" + existingNickname;
            // ニックネームを更新
            await member.setNickname(newNickname).catch(console.error);
            // リアクションを削除
            await reaction.users.remove(user.id).catch(console.error);
        }
    }
})

client.login(token);