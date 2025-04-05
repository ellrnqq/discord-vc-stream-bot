//--------------------------------------------------------------
//
// StreamService
//
//--------------------------------------------------------------
const client = require("../../index");
const { EmbedBuilder } = require("discord.js");
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource,
    EndBehaviorType, NoSubscriberBehavior, StreamType } = require("@discordjs/voice");
const { writeBotLog } = require("../../utilities/botLogger");
const AudioMixer = require('audio-mixer');
const Prism = require('prism-media');
const { PassThrough } = require('stream');
const { broadcastAudio } = require('./StreamConnectionService');
require('date-utils');
const { connectionVC, disConnectionVC } = require("../voice/VoiceService");

//メインボット設定
const config = require("../../config/config.json").BotSettings[0];
const botStreamJoinFlg = require("../../config/config.json").BotStreamJoinFlg;

//ストリーム開始
module.exports.startVcStream = startVcStream;
//ストリーム終了
module.exports.endVcStream = endVcStream;
//中継参加ユーザーリアクション取得
module.exports.getStreamVCUserReactionUsers = getStreamVCUserReactionUsers;

/**
 * VCストリーム起動(メイン処理)
 * @param interaction
 * @param userId
 * @param userName
 */
async function startVcStream(interaction, userId, userName) {
    try {
        //VC情報取得
        const member = await interaction.guild.members.fetch(interaction.member.id);

        //メインVCコネクション初期化
        const res = await connectionVC(interaction, userId, userName, true);
        if (res === false) { return false; };
        const mainVCconnection = getVoiceConnection(interaction.guild.id, config.BotId);

        //VC間中継開始メッセージ生成
        const embed = new EmbedBuilder()
            .setTitle("🔊VC中継モードを起動しました")
            .setDescription(`接続コード: \`${client.connectionCode}\`\nこのコードをサブボットの/connectコマンドで入力してください。`)
            .setColor("Green");
        await interaction.channel.send({ embeds: [embed] });
        
        //メッセージ表示
        await interaction.editReply("🔊VC中継を開始しました！");

        //VC中継ユーザー参加表示送信
        const vcOKuserEmbed = new EmbedBuilder()
            .setTitle("🔊VC中継ユーザーリスト")
            .setDescription("-----")
            .setColor("Green")
            .setTimestamp()
            .setFooter({ text: "現在0人" });
        const garmothAttendEmbedObj = await interaction.channel.send({ embeds: [vcOKuserEmbed] });
        //参加リアクション追加
        await garmothAttendEmbedObj.react("✅");

        //メインリスナー
        const mainListener = (speakingUserId) => {
            //ユーザーIDからユーザー情報取得
            const userinfo = client.users.cache.get(speakingUserId)
            //制限チェック
            //話しているのがBOTの場合
            if (userinfo.bot == true) {
                if (botStreamJoinFlg == false) {
                    //botStreamJoinFlg=falseの場合以降の処理しない
                    return;
                };
            }
            //話しているのがユーザーの場合
            else {
                //ユーザーリストにIDがない場合、以降の処理しない
                if ((client.subBotVoiceChannelsOKUsersList.includes(speakingUserId) === false)) {
                    return;
                };
            }

            writeBotLog("startVcStream MainBot --> SubBot receiver.speaking.on " +
                " userinfo.bot:" + userinfo.bot +
                " speakingUserId:" + speakingUserId, "trace", "info");

            //オーディオミキサー生成
            const mixer = new AudioMixer.Mixer({
                channels: 2,
                bitDepth: 16,
                sampleRate: 48000,
                clearInterval: 250,
            });
            const standaloneInput = new AudioMixer.Input({
                channels: 2,
                bitDepth: 16,
                sampleRate: 48000,
                volume: 300,
            });
            const audioMixer = mixer;
            audioMixer.addInput(standaloneInput);

            // VC音声取得
            const audio = mainVCconnection.receiver.subscribe(speakingUserId, {
                end: {
                    behavior: EndBehaviorType.AfterSilence,
                    duration: 100,
                },
            });

            //複数VC音声を１つにまとめるストリーム生成
            const rawStream = new PassThrough();
            //opus形式→PCM形式デコード＆オーディオミックスパイプライン処理
            audio
                .pipe(new Prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }))
                .pipe(rawStream);
            const p = rawStream.pipe(standaloneInput);

            // 音声データを接続されているサブボットに配信
            broadcastAudio(client.connectionCode, {
                mixer,
                resource: createAudioResource(mixer, {
                    inputType: StreamType.Raw,
                })
            });

            rawStream.on('end', () => {
                if (this.audioMixer != null) {
                    this.audioMixer.removeInput(standaloneInput);
                    standaloneInput.destroy();
                    rawStream.destroy();
                    p.destroy();
                }
            });
        };

        // MainBotが参加しているVCで誰かが話し出したらmainListener実行
        mainVCconnection.receiver.speaking.on('start', mainListener);

        // OKログ出力
        writeBotLog("startVcStream OK" +
            " guild.id:" + interaction.guild.id +
            " channel.id:" + interaction.channel.id +
            " userId:" + userId +
            " userName:" + userName, 'trace', 'info');

        return true;

    } catch (err) {
        // 例外エラーログ出力
        writeBotLog("startVcStream Error" +
            " guild.id:" + interaction.guild.id +
            " channel.id:" + interaction.channel.id +
            " userId:" + userId +
            " userName:" + userName, "trace", "error");
        writeBotLog(err, "trace", "error");
        return false;
    };
}

/**
 * VCストリーム終了
 * @param interaction
 * @param userId
 * @param userName
 */
async function endVcStream(interaction, userId, userName) {
    try {
        // VCコネクション初期化
        const res = await disConnectionVC(interaction, userId, userName, true);
        if (res === false) { return false; };

        // OKログ出力
        writeBotLog("endVcStream OK" +
            " guild.id:" + interaction.guild.id +
            " channel.id:" + interaction.channel.id +
            " userId:" + userId +
            " userName:" + userName, 'trace', 'info');
        return true;

    } catch (err) {
        // 例外エラーログ出力
        writeBotLog("endVcStream Error" +
            " guild.id:" + interaction.guild.id +
            " channel.id:" + interaction.channel.id +
            " userId:" + userId +
            " userName:" + userName, "trace", "error");
        writeBotLog(err, "trace", "error");
        return false;
    };
}

/**
 * 参加リアクションしたユーザー取得&メッセージ更新
 * @param {*} reaction
 * @param {*} user
 **/
async function getStreamVCUserReactionUsers(reaction, user) {
    try {
        reaction.message.reactions.cache.map(async (u_reaction) => {
            //リアクション絞り込み
            if (u_reaction.emoji.name !== "✅") return;
            //ユーザー取得
            let reactedUsers = await u_reaction.users.fetch();
            //配列セット
            let array = Array.from(reactedUsers.values());
            //タイトル取得
            const title = reaction.message.embeds[0].title;
            //リアクションからメンバーリスト取得
            let count = 0;
            let namelist = "";
            client.subBotVoiceChannelsOKUsersList = [];

            for (var i = 0; i < array.length; i++) {
                if (array[i].bot === false) {
                    //ユーザーの表示名取得
                    var guildUserInfo = await reaction.message.guild.members.fetch(array[i].id);
                    namelist = namelist + guildUserInfo.displayName + "\n";
                    //ユーザーID格納
                    client.subBotVoiceChannelsOKUsersList[i] = array[i].id;
                    count++;
                };
            };

            //メンバーが０人の場合
            if (namelist === "") {
                namelist = "-----";
            };

            //埋め込みメッセージ更新
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setColor("Green")
                .setDescription(namelist)
                .setTimestamp()
                .setFooter({ text: "現在" + (count) + "人" });
            reaction.message.edit({ embeds: [embed] });

            //OKログ出力
            writeBotLog("getStreamVCUserReactionUsers OK" +
                " guild.id:" + reaction.message.guild.id +
                " channel.id:" + reaction.message.channel.id +
                " user.id:" + user.id +
                " user.username:" + user.username, 'trace', 'info');
        });

        return true;

    } catch (err) {
        //例外エラーログ出力
        writeBotLog("getStreamVCUserReactionUsers Error " +
            " guild.id:" + reaction.message.guild.id +
            " channel.id:" + reaction.message.channel.id +
            " user.id:" + user.id +
            " user.username:" + user.username, 'trace', 'error');
        writeBotLog(err, 'trace', 'error');
        return false;
    };
}
