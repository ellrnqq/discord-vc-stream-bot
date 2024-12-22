//--------------------------------------------------------------
//
// ready events
//
//--------------------------------------------------------------
const client = require("../index");
const { writeBotLog } = require("../utilities/botLogger");
const config = require("../config/config.json").BotSettings[0];
//メインボット
client.on("ready", () => {
    try {
        //オンラインログ
        const botName = client.user.tag;
        //ステータスメッセージ
        client.user.setActivity(config.Prefix + " | Ver." + config.Version);
        //ログ
        writeBotLog(`${botName} Ver.${config.Version} is Online!`,'trace','info');
    } catch (err) {
        writeBotLog("Bot ready Error",'trace','error');
        writeBotLog(err,'trace','error');
        return;
    };
});
//サブボット
for(var i=0;i<client.discordSubClient.length;i++){
    const subClient = client.discordSubClient[i];
    subClient.on("ready", () => {
        try {
            const botName = subClient.user.tag;
            writeBotLog(`${botName} is Online!`,'trace','info');
        } catch (err) {
            writeBotLog("Bot ready Error",'trace','error');
            writeBotLog(err,'trace','error');
            return;
        };
    });
};