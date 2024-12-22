//--------------------------------------------------------------
//
// CommandHandler
//
//--------------------------------------------------------------
const { Client } = require("discord.js");
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
          //コマンド登録
          await client.guilds.cache.get(g.id).commands.set(arrayOfSlashCommands);
        });
      });

     } catch (err) {
       //例外エラー表示
       writeBotLog("slashcommandsフォルダから読込:NG",'trace','error');
       writeBotLog(err,'trace','error');
       return;
     };

};