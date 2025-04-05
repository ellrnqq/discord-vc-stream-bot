//--------------------------------------------------------------
//
// VC中継BOT
//
//--------------------------------------------------------------

//--------------------------------------------------------------
//ライブラリインポート
//--------------------------------------------------------------
const { Client, Collection,GatewayIntentBits,Partials } = require("discord.js");
const { writeBotLog } = require("./utilities/botLogger");
const config = require("./config/config.json").BotSettings[0];
const subbotConfig = require("./config/config.json").SubBotSettings;
const crypto = require('crypto');

//--------------------------------------------------------------
//DiscordClient生成
//--------------------------------------------------------------
const discordClient = new Client({
	'intents': [GatewayIntentBits.Guilds,
              GatewayIntentBits.MessageContent,
              GatewayIntentBits.GuildMessageReactions,
              GatewayIntentBits.GuildMessages,
              GatewayIntentBits.GuildMembers,
              GatewayIntentBits.GuildVoiceStates,
              GatewayIntentBits.GuildWebhooks,],
  'partials': [Partials.Message,
              Partials.Channel,
              Partials.Reaction,
              Partials.User,
              Partials.GuildMember,]
});

//--------------------------------------------------------------
//他で使えるようにモジュール化
//--------------------------------------------------------------
module.exports = discordClient;
writeBotLog("--- discord.js version." + require('discord.js').version + " ---",'trace','info');
writeBotLog('MainBot ' + config.BotName + ' Client Loaded Successfully','trace','info');

//--------------------------------------------------------------
//トークン読込
//--------------------------------------------------------------
const token = config.BotToken;
writeBotLog('MainBot:' + config.BotName + ' Config Loaded Successfully','trace','info');

//--------------------------------------------------------------
//サブボット生成
//--------------------------------------------------------------
var discordSubClient = [];
var subtoken = [];
for(var i=0;i<subbotConfig.length;i++){
  discordSubClient[i] = new Client({
    'intents': [GatewayIntentBits.GuildVoiceStates,GatewayIntentBits.Guilds, ],
    });
    subtoken[i] = subbotConfig[i].BotToken;
    writeBotLog('SubBot:' + subbotConfig[i].BotName + ' Client Loaded Successfully','trace','info');
    writeBotLog('SubBot:' + subbotConfig[i].BotName + ' Config Loaded Successfully','trace','info');
};


//--------------------------------------------------------------
//コレクション初期化
//--------------------------------------------------------------
discordClient.commands = new Collection();
discordClient.aliases = new Collection();
discordClient.events = new Collection();
discordClient.cooldowns = new Collection();
discordClient.cooldownsReaction = new Collection();
discordClient.slashCommands = new Collection();
discordClient.reactionAdds = new Collection();
discordClient.reactionRemoves = new Collection();
writeBotLog('MainBot ' + config.BotName + ' Collection Loaded Successfully','trace','info');

//--------------------------------------------------------------
//メインボット用コレクション初期化
//--------------------------------------------------------------
discordClient.discordClient = discordClient;
// 一意の接続コードを生成
const connectionCode = crypto.randomBytes(4).toString('hex').toUpperCase();
discordClient.connectionCode = connectionCode;
writeBotLog('MainBot Collection Loaded Successfully','trace','info');
writeBotLog(`Generated Connection Code: ${connectionCode}`, 'trace', 'info');

//--------------------------------------------------------------
//サブボット用コレクション初期化
//--------------------------------------------------------------
discordClient.discordSubClient = discordSubClient;
discordClient.subBotVoiceConnection = [];
discordClient.subBotVoiceChannels = [];
discordClient.subBotVoiceChannelsOKUsersList = [];
writeBotLog('SubBot Collection Loaded Successfully','trace','info');

//--------------------------------------------------------------
//ディスコードトークンが設定されているか？
//--------------------------------------------------------------
if(token === undefined){
  writeBotLog('MainBot:' + config.BotName + ' Token Not Found','trace','info');
  process.exit(0);
}else{
  writeBotLog('MainBot:' + config.BotName + ' Token Loaded Successfully','trace','info');
};

//--------------------------------------------------------------
//サブボットのディスコードトークンが設定されているか？
//--------------------------------------------------------------
for(var i=0;i<subbotConfig.length;i++){
   if(subtoken[i] === undefined){
     writeBotLog('SubBot:' + subbotConfig[i].BotName +' Token Not Found','trace','info');
     process.exit(0);
   }else{
       writeBotLog('SubBot:' + subbotConfig[i].BotName + ' Token Loaded Successfully','trace','info');
   };
};

//--------------------------------------------------------------
//discordログイン
//--------------------------------------------------------------
discordClient.login(token);
writeBotLog('MainBot:' + config.BotName + ' Login Successfully','trace','info');

//--------------------------------------------------------------
//サブdiscordログイン
//--------------------------------------------------------------
for(var i=0;i<subbotConfig.length;i++){
  discordClient.discordSubClient[i].login(subtoken[i]);
  writeBotLog('SubBot:' + subbotConfig[i].BotName + ' Login Successfully','trace','info');
};

//--------------------------------------------------------------
//イベントハンドラー読込
//--------------------------------------------------------------
["command"].forEach((handler) => {
  require(`./handler/${handler}`)(discordClient);
});

