const { ApplicationCommandOptionType } = require("discord.js");
const { startVcStream }= require('../../bizlogic/stream/StreamService');
const { writeBotLog } = require("../../utilities/botLogger");
const { registerMainBot } = require('../../bizlogic/stream/StreamConnectionService');
const slash = require("../../config/config.json").BotSettings[0].Slash;

module.exports = {
    name: 'stm',
    aliases: ['stm'],
    categories : 'stream',
    permissions : ' ',
    description: 'VC中継を開始します',
    cooldown : 3,
    usage: '',
    ephemeral: false,
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     * @param {*} command
     */
    run: async (client, interaction, args,command) => {
        try{
            //ログ出力
            writeBotLog( slash + command.name +
                        " guild.id:" + interaction.guild.id +
                        " channel.id:" + interaction.channel.id +
                        " username:" + interaction.user.username +
                        " slashCommand:" + slash + command.name + " " + args,'trace','info');

            // ユーザーがVCに接続しているか確認
            const member = interaction.member;
            if (!member.voice.channel) {
                await interaction.reply({ 
                    content: "❌ 先にVCに参加してください。",
                    ephemeral: true 
                });
                return false;
            }

            // メインボットとして登録
            registerMainBot(client.connectionCode, {
                id: client.user.id,
                name: client.user.username,
                guildId: interaction.guild.id
            });

            //ストリーム開始
            const res = await startVcStream(interaction, interaction.user.id, interaction.user.username);
            if(res === false){
                await interaction.editReply(`\`\`${slash + command.name}コマンド実行エラー\`\``);
                await interaction.deleteReply();
                return false;
            }else{
                await interaction.editReply({
                    content: `✅ VC中継を開始しました！\n接続コード: \`${client.connectionCode}\`\nこのコードをサブボットの\`/connect\`コマンドで入力してください。`,
                    ephemeral: true
                });
                return true;
            }
        } catch (err) {
            writeBotLog(err,'trace','error');
            await interaction.editReply(`\`\`${slash + command.name}コマンド実行時にエラーが発生しました\n${err}\`\``);
            return false;
        };
    },
}