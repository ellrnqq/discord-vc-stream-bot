const { writeBotLog } = require("../../utilities/botLogger");
const { disconnectSubBot } = require('../../bizlogic/stream/StreamConnectionService');
const slash = require("../../config/config.json").BotSettings[0].Slash;

module.exports = {
    name: 'disconnect',
    aliases: ['disconnect'],
    categories: 'stream',
    permissions: ' ',
    description: 'メインボットから切断します',
    cooldown: 3,
    usage: '',
    ephemeral: true,
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     * @param {*} command
     */
    run: async (client, interaction, args, command) => {
        try {
            //ログ出力
            writeBotLog(slash + command.name +
                " guild.id:" + interaction.guild.id +
                " channel.id:" + interaction.channel.id +
                " username:" + interaction.user.username +
                " slashCommand:" + slash + command.name + " " + args, 'trace', 'info');

            // 切断処理
            try {
                await disconnectSubBot(client.currentMainBot.connectionCode, {
                    id: client.user.id,
                    name: client.user.username,
                    guildId: interaction.guild.id
                });
                
                await interaction.reply({ 
                    content: "✅ メインボットから切断しました。",
                    ephemeral: true 
                });

                return true;
            } catch (error) {
                await interaction.reply({ 
                    content: "❌ メインボットに接続されていません。",
                    ephemeral: true 
                });
                return false;
            }

        } catch (err) {
            writeBotLog(err, 'trace', 'error');
            await interaction.reply({ 
                content: `\`\`${slash + command.name}コマンド実行時にエラーが発生しました\n${err}\`\``,
                ephemeral: true 
            });
            return false;
        }
    }
} 