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
      { 
        name: "中継先1",
        type: ApplicationCommandOptionType.Channel,
        channel_types: [2],
        description: "1つ目のボイスチャンネルを選択",
        required: true,
      },
      { 
        name: "中継先2",
        type: ApplicationCommandOptionType.Channel,
        channel_types: [2],
        description: "2つ目のボイスチャンネルを選択",
        required: false,
      },
      { 
        name: "中継先3",
        type: ApplicationCommandOptionType.Channel,
        channel_types: [2],
        description: "3つ目のボイスチャンネルを選択",
        required: false,
      },
      { 
        name: "中継先4",
        type: ApplicationCommandOptionType.Channel,
        channel_types: [2],
        description: "4つ目のボイスチャンネルを選択",
        required: false,
      },
      { 
        name: "中継先5",
        type: ApplicationCommandOptionType.Channel,
        channel_types: [2],
        description: "5つ目のボイスチャンネルを選択",
        required: false,
      },
      { 
        name: "中継先6",
        type: ApplicationCommandOptionType.Channel,
        channel_types: [2],
        description: "6つ目のボイスチャンネルを選択",
        required: false,
      },
      { 
        name: "中継先7",
        type: ApplicationCommandOptionType.Channel,
        channel_types: [2],
        description: "7つ目のボイスチャンネルを選択",
        required: false,
      },
      { 
        name: "中継先8",
        type: ApplicationCommandOptionType.Channel,
        channel_types: [2],
        description: "8つ目のボイスチャンネルを選択",
        required: false,
      },
      { 
        name: "中継先9",
        type: ApplicationCommandOptionType.Channel,
        channel_types: [2],
        description: "9つ目のボイスチャンネルを選択",
        required: false,
      },
      { 
        name: "中継先10",
        type: ApplicationCommandOptionType.Channel,
        channel_types: [2],
        description: "10つ目のボイスチャンネルを選択",
        required: false,
      },
      { 
        name: "中継先11",
        type: ApplicationCommandOptionType.Channel,
        channel_types: [2],
        description: "11つ目のボイスチャンネルを選択",
        required: false,
      },
      { 
        name: "中継先12",
        type: ApplicationCommandOptionType.Channel,
        channel_types: [2],
        description: "12つ目のボイスチャンネルを選択",
        required: false,
      }
    ],
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

        //選択されたチャンネルを配列に変換
        const channels = [];
        for (const option of interaction.options.data) {
            if (option.type === ApplicationCommandOptionType.Channel) {
                channels.push(option.value);
            }
        }

        //ストリーム開始
        const res = await startVcStream(interaction,interaction.user.id,interaction.user.username,channels);
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