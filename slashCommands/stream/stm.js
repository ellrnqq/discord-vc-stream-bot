const { ApplicationCommandOptionType } = require("discord.js");
const { startVcStream }= require('../../bizlogic/stream/StreamService');
const { writeBotLog } = require("../../utilities/botLogger");
const slash = require("../../config/config.json").BotSettings[0].Slash;

module.exports = {
    name: 'stm',
    aliases: ['stm'],
    categories : 'stream',
    permissions : ' ',
    description: 'VC中継を行います',
    options: [
      { name: "中継先",
                 type: ApplicationCommandOptionType.Channel,
                 channel_types: [2],
                 description: "中継先ボイスチャンネルを選択",
                 required: true,
      }],
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

        //ストリーム開始
        const res = await startVcStream(interaction,interaction.user.id,interaction.user.username,args);
        if(res === false){
            await interaction.editReply(`\`\`${slash + command.name}コマンド実行エラー\`\``);
            await interaction.deleteReply();
            return false;
        }else{
            return true;
        }
    } catch (err) {
        writeBotLog(err,'trace','error');
        await interaction.editReply(`\`\`${slash + command.name}コマンド実行時にエラーが発生しました\n${err}\`\``);
        return false;
      };
    },
}