//--------------------------------------------------------------
//
// messageReactionAdd events
//
//--------------------------------------------------------------
const client = require("../index");
const { writeBotLog } = require("../utilities/botLogger");
//クールダウン処理読込
const { cooldownsReaction } = require("../utilities/function");

client.on('messageReactionAdd', async (reaction, user) => {
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
                writeBotLog("messageReactionAdd reaction.fetch Error" +
                    " guild.id:" + reaction.message.guild.id +
                    " username:" + user.username + 
                    " emoji.name:" + reaction.emoji.name,'trace','error');
                writeBotLog(err,'trace','error');
                return;
            };
        };
        //リアクションメッセージ作成者IDがclient BotIdと違う場合はスルー
        if(reaction.message.author.id !== client.user.id){ return; };
        //リアクション元のメッセージがない場合
        if(reaction.message.embeds.length <= 0){ return; };

        //--------------------------------------------------------------
        // Reaction Add Handling
        //--------------------------------------------------------------
        client.reactionAdds.map( async reactionAdd => {
            if(reactionAdd.emojis.includes(reaction.emoji.name) === true){
                var reactionTargetHit = false;
                for(var g=0;g<reactionAdd.reactionTarget.length;g++){
                    if(reaction.message.embeds[0].title === null){
                        reactionTargetHit = true;
                    }else{
                        if((reaction.message.embeds[0].title.indexOf(reactionAdd.reactionTarget[g]) > -1)){
                            reactionTargetHit = true;
                        };
                    }
                };
                //リアクションメッセージのタイトルにreactionAdd.reactionTargetで設定した文字列がある場合のみ後続処理実行
                if((reactionTargetHit === false)){ return; };
                //リアクション連続実行禁止処理
                if (cooldownsReaction(reaction.message, reactionAdd)) {
                    writeBotLog("❌ 連続で" + reactionAdd.name +"リアクションはできません! " +
                        " guild.id:" + reaction.message.guild.id +
                        " username:" + user.username + 
                        " emoji.name:" + reaction.emoji.name,'trace','info');
                    //リアクション削除
                    await reaction.message.reactions.cache.get(reaction.emoji.name).users.remove(user);
                    await reaction.message.update({content: `❌ 連続でリアクションはできません! ${cooldownsReaction(reaction.message, reactionAdd)}秒待ってね`});
                    return;
                }else{
                    //実行
                    await reactionAdd.run(client, reaction, user, reactionAdd);
                    return;
                };
            };
        });

    } catch (err) {
        writeBotLog("messageReactionAdd events Error",'trace','error');
        writeBotLog(err,'trace','error');
        return;
    };

});
