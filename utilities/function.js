const { Collection} = require('discord.js');
const { writeBotLog } = require("./botLogger");

module.exports.escapeRegex = escapeRegex;
module.exports.onCoolDown = onCoolDown;
module.exports.cooldownsReaction = cooldownsReaction;

/**
 * エスケープ文字処理
 * @param {*} str
 * @returns 文字列
 */
function escapeRegex(str) {
    try {
        return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
    } catch (err) {
      writeBotLog(err,'trace','error');
    }
};

/**
 * クールダウン処理(コマンド)
 * @param {*} message
 * @param {*} command
 * @returns 文字列
 */
function onCoolDown(message, command) {

    if(!message || !message.client) throw "第一引数に有効なDiscord.clinetを持つmessageがセットされていません";
    if(!command || !command.name) throw "第二引数に有効なcommand.nameを持つcommandがセットされていません";

    const client = message.client;

    if (!client.cooldowns.has(command.name)) {
      client.cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return timeLeft
      }
      else {
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        return false;
      }
    }
    else {
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
      return false;
    }
};

/**
 * クールダウン処理（リアクション）
 * @param {*} message
 * @param {*} reaction
 * @returns 文字列
 */
function cooldownsReaction(message, reaction) {

    if(!message || !message.client) throw "第一引数に有効なDiscord.clinetを持つmessageがセットされていません";
    if(!reaction || !reaction.name) throw "第二引数に有効なreaction.nameを持つreactionがセットされていません";

    //console.log(reaction.name);
    //console.log(reaction.cooldown);

    const client = message.client;

    if (!client.cooldownsReaction.has(reaction.name)) {
      client.cooldownsReaction.set(reaction.name, new Collection());
    }

    const now = Date.now();
    const timestamps = client.cooldownsReaction.get(reaction.name);
    const cooldownAmount = (reaction.cooldown) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return timeLeft
      }
      else {
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        return false;
      }
    }
    else {
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
      return false;
    }
};
