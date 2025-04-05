const { writeBotLog } = require("../../utilities/botLogger");

// 接続されているメインボットの管理
const connectedMainBots = new Map();

/**
 * メインボットの登録
 * @param {string} connectionCode 接続コード
 * @param {Object} mainBot メインボットの情報
 */
function registerMainBot(connectionCode, mainBot) {
    connectedMainBots.set(connectionCode, {
        ...mainBot,
        connectedSubBots: new Set(),
        lastActive: Date.now()
    });
    writeBotLog(`MainBot registered with code: ${connectionCode}`, 'trace', 'info');
}

/**
 * サブボットの接続
 * @param {string} connectionCode 接続コード
 * @param {Object} subBot サブボットの情報
 */
async function connectSubBot(connectionCode, subBot) {
    const mainBot = connectedMainBots.get(connectionCode);
    if (!mainBot) {
        throw new Error('Invalid connection code');
    }

    mainBot.connectedSubBots.add(subBot);
    writeBotLog(`SubBot connected to MainBot with code: ${connectionCode}`, 'trace', 'info');
    return mainBot;
}

/**
 * サブボットの切断
 * @param {string} connectionCode 接続コード
 * @param {Object} subBot サブボットの情報
 */
function disconnectSubBot(connectionCode, subBot) {
    const mainBot = connectedMainBots.get(connectionCode);
    if (mainBot) {
        mainBot.connectedSubBots.delete(subBot);
        writeBotLog(`SubBot disconnected from MainBot with code: ${connectionCode}`, 'trace', 'info');
    }
}

/**
 * メインボットの音声データを配信
 * @param {string} connectionCode 接続コード
 * @param {Object} audioData 音声データ
 */
function broadcastAudio(connectionCode, audioData) {
    const mainBot = connectedMainBots.get(connectionCode);
    if (!mainBot) return;

    mainBot.connectedSubBots.forEach(subBot => {
        try {
            subBot.playAudio(audioData);
        } catch (error) {
            writeBotLog(`Error broadcasting audio to SubBot: ${error}`, 'trace', 'error');
        }
    });
}

/**
 * 接続コードの有効性チェック
 * @param {string} connectionCode 接続コード
 */
function isValidConnectionCode(connectionCode) {
    return connectedMainBots.has(connectionCode);
}

/**
 * 定期的な接続状態のクリーンアップ
 */
function cleanupConnections() {
    const now = Date.now();
    const timeout = 30 * 60 * 1000; // 30分

    for (const [code, mainBot] of connectedMainBots.entries()) {
        if (now - mainBot.lastActive > timeout) {
            connectedMainBots.delete(code);
            writeBotLog(`Cleaned up inactive connection: ${code}`, 'trace', 'info');
        }
    }
}

// 定期的なクリーンアップの実行
setInterval(cleanupConnections, 5 * 60 * 1000); // 5分ごと

module.exports = {
    registerMainBot,
    connectSubBot,
    disconnectSubBot,
    broadcastAudio,
    isValidConnectionCode
}; 