//--------------------------------------------------------------
//
// messageReactionRemove events
//
//--------------------------------------------------------------
const client = require("../index");
const { writeBotLog } = require("../utilities/botLogger");
//クールダウン処理読込
const { cooldownsReaction } = require("../utilities/function");

client.on('messageReactionRemove', async (reaction, user) => {
    try {
        //メッセージ送信者がBOTのリアクションは無視
        if (user.bot){ return; };
        // リアクションを受信した時にreaction.partialかどうか判断
        if (reaction.partial) {
            //reactionが含まれるメッセージが削除された場合、フェッチは API エラーを引き起こすので例外処理を作って回避
            try {
                //リアクションを取り出す
                await reaction.fetch();
            } catch (err) {
                //エラーの場合
                writeBotLog("messageReactionRemove reaction.fetch Error" +
                    " guild.id:" + reaction.message.guild.id +
                    " username:" + user.username + 
                    " emoji.name:" + reaction.emoji.name,'trace','error');
                writeBotLog(err,'trace','error');
                return;
            };
        };
        //リアクションメッセージ作成者IDがclient BotIdと違う場合はスルー
        if(reaction.message.author.id !== client.user.id){ return; };

        //--------------------------------------------------------------
        // Reaction Remove Handling
        //--------------------------------------------------------------
        client.reactionRemoves.map(async reactionRemove => {
            if(reactionRemove.emojis.includes(reaction.emoji.name) === true){
                //リアクションメッセージのタイトルにreactionRemove.reactionTargetで設定した文字列がある場合のみ後続処理実行
                var reactionTargetHit = false;
                for(var g=0;g<reactionRemove.reactionTarget.length;g++){
                    if(reaction.message.embeds[0].title === null){
                        reactionTargetHit = true;
                    }else{
                        if((reaction.message.embeds[0].title.indexOf(reactionRemove.reactionTarget[g]) > -1)){
                            reactionTargetHit = true;
                        };
                    }
                };
                //リアクションメッセージのタイトルにreactionAdd.reactionTargetで設定した文字列がある場合のみ後続処理実行
                if((reactionTargetHit === false)){ return; };
                //リアクション連続実行禁止処理
                if (cooldownsReaction(reaction.message, reactionRemove)) {
                    writeBotLog("❌ 連続で" + reactionRemove.name + "リアクションは取消できません! " +
                        " guild.id:" + reaction.message.guild.id + 
                        " username:" + user.username + 
                        " emoji.name:" + reaction.emoji.name,'trace','info');
                    await reaction.message.update({content: `❌ 連続でリアクションは取消できません! ${cooldownsReaction(reaction.message, reactionRemove)}秒待ってね`});
                    return;
                }else{
                    //実行
                    await reactionRemove.run(client, reaction, user, reactionRemove);
                    return;
                };
            };
        });
    } catch (err) {
        writeBotLog("messageReactionRemove events Error",'trace','error');
        writeBotLog(err,'trace','error');
        return;
    };
});