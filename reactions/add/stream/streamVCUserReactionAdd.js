//--------------------------------------------------------------
//
// streamVCUserReactionAdd
//
//--------------------------------------------------------------
const { writeBotLog } = require("../../../utilities/botLogger");
const { getStreamVCUserReactionUsers,}= require('../../../bizlogic/stream/StreamService');

module.exports = {
    name: "streamVCUserReactionAdd",
    emojis : ["✅"],
    categories : "stream",
    permissions : " ",
    description: "VC中継ユーザー追加リアクション",
    cooldown : 0,
    reactionTarget : ["🔊VC中継ユーザーリスト"],
    usage: "",
    /**
     * @param {Client} client
     * @param {Reaction} reaction
     * @param {User} user
     * @param {Collection} reactionAdd
     */
    run: async(client, reaction,user,reactionAdd) => {
        try {
            writeBotLog(reactionAdd.name + 
                " guild.id:" + reaction.message.guild.id + 
                " username:" + user.username + 
                " emoji.name:" + reaction.emoji.name,'trace','info');

            //メッセージにリアクショした場合
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