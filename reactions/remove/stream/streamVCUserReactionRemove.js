//--------------------------------------------------------------
//
// streamVCUserReactionRemove
//
//--------------------------------------------------------------
const { getStreamVCUserReactionUsers,}= require('../../../bizlogic/stream/StreamService');
const { writeBotLog } = require("../../../utilities/botLogger");

module.exports = {
    name: "streamVCUserReactionRemove",
    emojis : ["✅"],
    categories : "stream",
    permissions : " ",
    description: "VC中継ユーザー取消リアクション",
    cooldown : 0,
    reactionTarget : ["🔊VC中継ユーザーリスト"],
    usage: "",
    /**
     * @param {Client} client
     * @param {Reaction} reaction
     * @param {User} user
     * @param {Collection} reactionRemove
     */
    run: async(client, reaction,user,reactionRemove) => {
        try{
            writeBotLog(reactionRemove.name + 
                " guild.id:" + reaction.message.guild.id + 
                " username:" + user.username + 
                " emoji.name:" + reaction.emoji.name,'trace','info');
            //ガーモス参加メッセージにリアクショした場合
            if((reaction.message.embeds.length > 0) &&
                (reaction.emoji.name === "✅") &&
                (reaction.message.embeds[0].title.indexOf("🔊VC中継ユーザーリスト") !== -1)){
                    //リアクションした人を取得
                    await getStreamVCUserReactionUsers(reaction,user);
                    return;
            };
        } catch (err) {
            writeBotLog(err,'trace','error');
            return;
        }
    }
};