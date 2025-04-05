const { ApplicationCommandOptionType } = require("discord.js");
const { writeBotLog } = require("../../utilities/botLogger");
const { connectSubBot } = require('../../bizlogic/stream/StreamConnectionService');
const { createAudioPlayer, getVoiceConnection, NoSubscriberBehavior, joinVoiceChannel } = require("@discordjs/voice");
const slash = require("../../config/config.json").BotSettings[0].Slash;

module.exports = {
    name: 'connect',
    aliases: ['connect'],
    categories: 'stream',
    permissions: ' ',
    description: 'メインボットに接続します',
    options: [
        {
            name: "接続コード",
            type: ApplicationCommandOptionType.String,
            description: "メインボットから取得した接続コード",
            required: true,
        }
    ],
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

            // ユーザーがVCに接続しているか確認
            const member = interaction.member;
            if (!member.voice.channel) {
                await interaction.reply({ 
                    content: "❌ 先にVCに参加してください。",
                    ephemeral: true 
                });
                return false;
            }

            // 接続コードを取得
            const connectionCode = interaction.options.getString("接続コード");
            
            // メインボットとの接続処理
            try {
                const mainBot = await connectSubBot(connectionCode, {
                    id: client.user.id,
                    name: client.user.username,
                    guildId: interaction.guild.id,
                    playAudio: (audioData) => {
                        // 音声再生処理
                        const player = createAudioPlayer({
                            behaviors: {
                                noSubscriber: NoSubscriberBehavior.Play,
                            },
                        });
                        player.play(audioData.resource);
                        // VCに接続して音声を再生
                        const connection = getVoiceConnection(interaction.guild.id);
                        if (connection) {
                            connection.subscribe(player);
                        }
                    }
                });

                // ユーザーのVCに接続
                const connection = joinVoiceChannel({
                    channelId: member.voice.channel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                    selfDeaf: false,
                    selfMute: false
                });

                // 接続が確立されたことを確認
                connection.on('ready', () => {
                    writeBotLog(`SubBot ${client.user.username} connected to VC: ${member.voice.channel.name}`, 'trace', 'info');
                });

                // エラーハンドリング
                connection.on('error', (error) => {
                    writeBotLog(`VC connection error: ${error.message}`, 'trace', 'error');
                });
                
                await interaction.reply({ 
                    content: `✅ メインボット「${mainBot.name}」に接続しました！\nVC「${member.voice.channel.name}」に接続しました。\n音声の受信準備が整いました。`,
                    ephemeral: true 
                });

                return true;
            } catch (error) {
                await interaction.reply({ 
                    content: "❌ 無効な接続コードです。メインボットから正しいコードを取得してください。",
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