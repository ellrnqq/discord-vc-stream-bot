//--------------------------------------------------------------
//
// VoiceService
//
//--------------------------------------------------------------
const client = require("../../index");
const { EmbedBuilder } = require('discord.js');
const { joinVoiceChannel,getVoiceConnection,VoiceConnectionStatus } = require("@discordjs/voice");
const { writeBotLog } = require("../../utilities/botLogger");
require('date-utils');
//メインボット設定
const botConfig = require("../../config/config.json").BotSettings[0];
//サブボット設定
const subbotConfig = require("../../config/config.json").SubBotSettings;

//VC接続/切断
module.exports.connectionVC = connectionVC;
module.exports.disConnectionVC = disConnectionVC;
module.exports.connectionSubVC = connectionSubVC;

/**
 * メインボットのVC接続処理
 * @param interaction
 * @param userId
 * @param userName
 */
async function connectionVC(interaction,userId,userName){
    try {
        //ユーザーが接続しているVC情報取得
        const member = await interaction.guild.members.fetch(interaction.member.id);
        const memberVC = member.voice.channel;

        //VC接続チェック
        if (!memberVC) {
            //エラーメッセージ生成
            const errorEmbed = new EmbedBuilder()
                                    .setTitle("VCエラー")
                                    .setColor("red")
                                    .setDescription("VCに参加してません。コマンドを利用する時はVCに参加して下さい。");
            //メッセージ送信
            await interaction.channel.send({ embeds: [errorEmbed] });
            //ログ出力
            writeBotLog("connectionVC 「" + interaction.member.displayName + "」はVCに参加してません。コマンドを利用する時はVCに参加して下さい。" +
                        " guild.id:" + interaction.guild.id +
                        " channel.id:" + interaction.channel.id +
                        " userId:" + userId +
                        " userName:" + userName,'trace','info');
            return false;
        };

        //VC接続
        const jvc = joinVoiceChannel({ group: botConfig.BotId,
                                       guildId: interaction.guild.id,
                                       channelId: memberVC.id,
                                       adapterCreator: interaction.guild.voiceAdapterCreator,
                                       selfMute: false,});

        //VC接続ステータスモニタリング
        jvc.once(VoiceConnectionStatus.Ready, () => {
            writeBotLog("connectionVC VoiceConnectionStatusがReady状態になりました! オーディオを再生する準備ができました!",'trace','info');
        });

        //接続成功した場合
        return true;

    } catch (err) {
        //例外エラー
        writeBotLog("connectionVC Error" +
                    " guild.id:" + interaction.guild.id +
                    " channel.id:" + interaction.channel.id +
                    " userId:" + userId +
                    " userName:" + userName,'trace','error');
        writeBotLog(err,'trace','error');
        return false;
    };
};

/**
 * サブボットのVC接続処理
 * @param interaction
 * @param targetVC
 * @param botIndex
 */
async function connectionSubVC(interaction, targetVC, botIndex) {
    try {
        const subBot = subbotConfig[botIndex];
        if (!subBot) {
            writeBotLog("connectionSubVC Error: Invalid bot index", 'trace', 'error');
            return false;
        }

        //VC接続
        const jvc = joinVoiceChannel({
            group: subBot.BotId,
            guildId: interaction.guild.id,
            channelId: targetVC.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
            selfMute: false,
        });

        //VC接続ステータスモニタリング
        jvc.once(VoiceConnectionStatus.Ready, () => {
            writeBotLog(`connectionSubVC ${subBot.BotName} VoiceConnectionStatusがReady状態になりました!`, 'trace', 'info');
        });

        return true;
    } catch (err) {
        writeBotLog("connectionSubVC Error: " + err, 'trace', 'error');
        return false;
    }
}

/**
 * VC接続切断処理
 * @param interaction
 * @param userId
 * @param userName
 */
async function disConnectionVC(interaction,userId,userName){
    try {
        //メインボットのVCコネクション破棄
        if(getVoiceConnection(interaction.guild.id,botConfig.BotId)){
            getVoiceConnection(interaction.guild.id,botConfig.BotId).destroy();
        };

        //サブボットのVCコネクション破棄
        for(var i=0; i<subbotConfig.length;i++ ){
            if(getVoiceConnection(interaction.guild.id,subbotConfig[i].BotId)){
                getVoiceConnection(interaction.guild.id,subbotConfig[i].BotId).destroy();
            };
        };
        client.subBotVoiceConnection = [];
        client.subBotVoiceChannels = [];
        client.subBotVoiceChannelsOKUsersList = [];

        //OKメッセージ
        writeBotLog("disConnectionVC OK" +
                    " guild.id:" + interaction.guild.id +
                    " channel.id:" + interaction.channel.id +
                    " userId:" + userId +
                    " userName:" + userName,'trace','info');
        return true;
    } catch (err) {
        //例外エラー
        writeBotLog("disConnectionVC Error" +
                    " guild.id:" + interaction.guild.id +
                    " channel.id:" + interaction.channel.id +
                    " userId:" + userId +
                    " userName:" + userName,'trace','error');
        writeBotLog(err,'trace','error');
        return false;
    };
};