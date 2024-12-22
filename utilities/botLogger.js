const log4js = require('log4js');
require('date-utils');

module.exports.writeBotLog = writeBotLog;

/**
 * ログ出力
 * @param {*} log
 * @param {*} loglevel
 * @param {*} logType
 */
 function writeBotLog(log,logLevel,logType) {
    try {

        //現在日時取得
        let nowDate = new Date().toFormat("YYYYMMDD");
        //ログ設定
        log4js.configure({
            appenders : {
                Bot : {type : 'file', filename : "./log/botlog_" + nowDate +".log"}
            },
            categories : {
              default : {appenders : ['Bot'], level : logLevel},
            }
          });

        const logger = log4js.getLogger('Bot');
        logger.level = logLevel;

        if(logType == 'error'){
            console.error("[" + new Date().toISOString() + "] " + log);
            logger.error(log);
        }else if(logType == 'info'){
            console.log("[" + new Date().toISOString() + "] " + log);
            logger.info(log);
        }else{
            console.log("[" + new Date().toISOString() + "] " + log);
            logger.info(log);
        };

        return;

    } catch (err) {
        console.log(new Date().toISOString() + " " + String(err.stack).bgRed);
    };
};
