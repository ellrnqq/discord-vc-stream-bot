const { endVcStream }= require('../../bizlogic/stream/StreamService');
const { writeBotLog } = require("../../utilities/botLogger");
const slash = require("../../config/config.json").BotSettings[0].Slash;

module.exports = {
    name: 'bye',
    aliases: ['bye'],
    categories : 'stream',
    permissions : ' ',
    description: 'VC中継を終了します',
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

        //ストリーム終了
        await endVcStream(interaction,interaction.user.id,interaction.user.username);
        await interaction.editReply(`\`\`${slash + command.name}コマンド実行\`\``).catch(() => {});
        await interaction.deleteReply();
        return true;

    } catch (err) {
        writeBotLog(err,'trace','error');
        await interaction.editReply(`\`\`${slash + command.name}コマンド実行時にエラーが発生しました\n${err}\`\``);
        return false;
      };
    },
}