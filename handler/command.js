//--------------------------------------------------------------
//
// CommandHandler
//
//--------------------------------------------------------------
const { Client, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const ascii = require("ascii-table");
const { writeBotLog } = require("../utilities/botLogger");

//イベント
let eventsTable = new ascii("Events");
eventsTable.setHeading("Events", "Load status");
//スラッシュコマンド
let slashCommandsTable = new ascii("SlashCommands");
slashCommandsTable.setHeading("SlashCommands", "Load status");
//リアクション追加
let reactionAddsTable = new ascii("ReacrionAdds");
reactionAddsTable.setHeading("ReacrionAdds", "Load status");
//リアクション取り消し
let reactionRemovesTable = new ascii("ReacrionRemoves");
reactionRemovesTable.setHeading("ReacrionRemoves", "Load status");

/**
 * コマンド＆イベントハンドラーの生成＆準備
 * @param {Client} client
 */
 module.exports = async (client) => {


    //--------------------------------------------------------------
    // reactions/add フォルダから読込
    //--------------------------------------------------------------
    try {
      //フォルダ配下のコマンド格納フォルダ一覧取得
      readdirSync("./reactions/add/").forEach((dir) => {
          //格納フォルダ内のファイル一覧取得
          const reactionAdds = readdirSync(`./reactions/add/${dir}/`).filter((file) =>
          file.endsWith(".js")
          );
          for (let file of reactionAdds) {
              //ファイル読込
              let pull = require(`../reactions/add/${dir}/${file}`);
              if (pull.emojis) {
                  //ファイルが正しい場合、セット
                  client.reactionAdds.set(pull.name, pull);
                  reactionAddsTable.addRow(file, "Ready");
              } else {
                  //ファイルが不正な場合、エラーセット
                  reactionAddsTable.addRow(
                  file,
                  `error -> reactionsAddファイルが見つかりません`
                  );
                  continue;
              }
          }
      });

      if(reactionAddsTable.__rows.length == 0){
        reactionAddsTable.addRow("reactionsAdd", "Nothing");
      }

      //テーブル一覧表示
      writeBotLog('\n' + reactionAddsTable.toString(),'trace','info');

  } catch (err) {
      //例外エラー表示
      writeBotLog("reactions/add フォルダから読込:NG",'trace','error');
      writeBotLog(err,'trace','error');
      return;
  };


  //--------------------------------------------------------------
  // reactions/remove フォルダから読込
  //--------------------------------------------------------------
  try {
    //フォルダ配下のコマンド格納フォルダ一覧取得
    readdirSync("./reactions/remove/").forEach((dir) => {
        //格納フォルダ内のコマンドファイル一覧取得
        const reactionRemoves = readdirSync(`./reactions/remove/${dir}/`).filter((file) =>
        file.endsWith(".js")
        );
        for (let file of reactionRemoves) {
            //ファイル読込
            let pull = require(`../reactions/remove/${dir}/${file}`);
            if (pull.name) {
                //ファイルが正しい場合、セット
                client.reactionRemoves.set(pull.name, pull);
                reactionRemovesTable.addRow(file, "Ready");
            } else {
                //ファイルが不正な場合、エラーセット
                reactionRemovesTable.addRow(
                file,
                `error -> reactionsRemoveファイルが見つかりません`
                );
                continue;
            }
        }
    });

    if(reactionRemovesTable.__rows.length == 0){
      reactionRemovesTable.addRow("reactionsRemove", "Nothing");
    }

    //reactions/remove テーブル一覧表示
    writeBotLog('\n' + reactionRemovesTable.toString(),'trace','info');

  } catch (err) {
    //例外エラー表示
    writeBotLog("reactions/remove フォルダから読込:NG",'trace','error');
    writeBotLog(err,'trace','error');
    return;
  };


    //--------------------------------------------------------------
    //eventsフォルダから読込
    //--------------------------------------------------------------
    try {
      readdirSync("./events/").forEach((file) => {
        const events = readdirSync("./events/").filter((file) =>
          file.endsWith(".js")
        );
        for (let file of events) {
          let pull = require(`../events/${file}`);
          if (pull.name) {
            client.events.set(pull.name, pull);
          }
        }
        eventsTable.addRow(file, "Ready");
      });

      if(eventsTable.__rows.length == 0){
        eventsTable.addRow("events", "Nothing");
      }

      //イベントテーブル一覧表示
      writeBotLog('\n' + eventsTable.toString(),'trace','info');

    } catch (err) {
      //例外エラー表示
      writeBotLog("eventsフォルダから読込:NG",'trace','error');
      writeBotLog(err,'trace','error');
      return;
    };



    // //--------------------------------------------------------------
    // //slashcommandsフォルダから読込
    // //--------------------------------------------------------------
    try {

       const arrayOfSlashCommands = [];
       //フォルダ配下のコマンド格納フォルダ一覧取得
       readdirSync("./slashCommands/").forEach((dir) => {
         //格納フォルダ内のコマンドファイル一覧取得
         const slashCommands = readdirSync(`./slashCommands/${dir}/`).filter((file) =>
         file.endsWith(".js")
         );
        for (let file of slashCommands) {
          //ファイル読込
          let pull = require(`../slashCommands/${dir}/${file}`);
          if (pull.name) {
            client.slashCommands.set(pull.name, pull);
            arrayOfSlashCommands.push(pull);
            slashCommandsTable.addRow(file, "Ready");
          }else {
            //ファイルが不正な場合、エラーセット
            slashCommandsTable.addRow(
            file,
            `error -> slashCommandファイルが見つかりません`
            );
            continue;
          }
        }
      });

      if(slashCommandsTable.__rows.length == 0){
        slashCommandsTable.addRow("slashCommands", "Nothing");
      }

      //スラッシュコマンドテーブル一覧表示
      writeBotLog('\n' + slashCommandsTable.toString(),'trace','info');

      //スラッシュコマンド登録
      client.on("ready", async () => {
        //ギルドコマンドで登録
        client.guilds.cache.forEach(async (g) => {
          //メインボットのコマンドを登録
          const mainBotCommands = arrayOfSlashCommands.filter(cmd => 
            cmd.name === 'stm' || cmd.name === 'bye'
          );
          await client.guilds.cache.get(g.id).commands.set(mainBotCommands);
        });
      });

      //サブボットのコマンド登録とハンドラー設定
      for(let i = 0; i < client.discordSubClient.length; i++) {
        const subBot = client.discordSubClient[i];
        
        // サブボットにコレクションを設定
        subBot.slashCommands = new Collection();
        
        // サブボットのコマンドをコレクションに追加
        const subBotCommands = arrayOfSlashCommands.filter(cmd => 
          cmd.name === 'connect' || cmd.name === 'disconnect'
        );
        subBotCommands.forEach(cmd => {
          subBot.slashCommands.set(cmd.name, cmd);
        });

        // サブボットのready時にコマンドを登録
        subBot.on("ready", async () => {
          subBot.guilds.cache.forEach(async (g) => {
            try {
              await g.commands.set(subBotCommands);
              writeBotLog(`SubBot ${i+1} commands registered in guild ${g.name}`, 'trace', 'info');
            } catch (error) {
              writeBotLog(`Failed to register commands for SubBot ${i+1} in guild ${g.name}: ${error.message}`, 'trace', 'error');
            }
          });
        });

        // サブボットのインタラクションハンドラーを設定
        subBot.on('interactionCreate', async (interaction) => {
          if (!interaction.isCommand()) return;

          const command = subBot.slashCommands.get(interaction.commandName);
          if (!command) return;

          try {
            await command.run(subBot, interaction, [], command);
          } catch (error) {
            writeBotLog(`Error executing command ${interaction.commandName} for SubBot ${i+1}: ${error.message}`, 'trace', 'error');
            await interaction.reply({ 
              content: 'コマンドの実行中にエラーが発生しました。', 
              ephemeral: true 
            });
          }
        });
      }

     } catch (err) {
       //例外エラー表示
       writeBotLog("slashcommandsフォルダから読込:NG",'trace','error');
       writeBotLog(err,'trace','error');
       return;
     };

};