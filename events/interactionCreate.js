//--------------------------------------------------------------
//
// interactionCreate events
//
//--------------------------------------------------------------
const { ApplicationCommandOptionType} = require("discord.js");
const client = require("../index");
const { writeBotLog } = require("../utilities/botLogger");

client.on("interactionCreate", async (interaction) => {
    try {

        //メッセージ送信者がBOTのリアクションは無視
        if (interaction.user.bot){ return; };

        //--------------------------------------------------------------
        // Slash Command Handling
        //--------------------------------------------------------------
        if (interaction.isChatInputCommand()) {
            const cmd = client.slashCommands.get(interaction.commandName);
            if (!cmd){
                await interaction.deferReply({ ephemeral: false }).catch(() => {});
                return interaction.followUp({ content: "スラッシュコマンドでエラーが発生しました!" });
            }
            const args = [];
            for (let option of interaction.options.data) {
                if (option.type === ApplicationCommandOptionType.Subcommand) {
                    if (option.name) args.push(option.name);
                    option.options?.forEach((x) => {
                        if (x.value) args.push(x.value);
                    });
                } else if (option.value) args.push(option.value);
            };
            interaction.member = interaction.guild.members.cache.get(interaction.user.id);
            if(cmd.ephemeral === true){
                await interaction.deferReply({ ephemeral: true }).catch(() => {});
            }else{
                await interaction.deferReply({ ephemeral: false }).catch(() => {});
            }
            cmd.run(client, interaction, args,cmd);
            return;
        };

    } catch (err) {
        writeBotLog("interactionCreate events Error",'trace','error');
        writeBotLog(err,'trace','error');
    };
});