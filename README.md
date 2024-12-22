# discord-vc-stream-bot
Discord.jsで作成したDiscordの読み上げBOTです。

セルフホストして自由に利用してください。

Windows11 Proで動作保証しています。

# デモ
デモでは、VC名「ボイスチャンネル」で読み上げたBOTの音声をVC名「ゲーム」へ中継しています。

自分のしゃべった声も中継させる事ができます。

https://github.com/user-attachments/assets/41bf14c1-4c5f-4305-bc08-3296e23259e3



# 開発環境
OS (Windows11 pro)

discord.js (14.16.3)

@discordjs/voice (^0.18.0)

prism-media (1.3.5)

audio-mixer (2.1.4)

node.js (22.12.0)

npm (10.9.0)



## 環境構築手順

### node.jsの準備
Node.js 22.12.0 をダウンロードして、インストールしてください。

https://nodejs.org/en

### Bot準備
ソースコード取得
```
git clone https://github.com/haru-works/discord-vc-stream-bot.git
```

### Node.jsのパッケージインストール
```
npm install
```

※package.jsonがあるディレクトリで実行して下さい。

### Botトークンの取得
BotトークンをDiscord Developer Portalから取得してください。ここでは取得方法は省略します。

### configの設定

coinfigフォルダ内のconfig_sample.jsonをconfig.jsonにリネーム

中身を下記のように修正してください。

 - 1.BotSettingsのBotTokenにマイク用ボットトークンを設定する
 - 2.BotSettingsのBotUserIdにマイク用ボットIDを設定する
 - 3.SubBotSettingsのBotTokenにスピーカー用ボットトークンを設定する
 - 4.SubBotSettingsのBotUserIdにスピーカー用ボットIDを設定する
 - 5.読み上げBOT等のBOTの音声も中継したい場合は、BotStreamJoinFlgをtrueにする。中継したくない場合は、falseにする
```
{
    "BotSettings":[
        {
            "Version": "1.0.0",
            "BotToken": "ここにマイク用ボットトークンを設定する",
            "BotId":"mic_room1",
            "Prefix": "",
            "Slash": "/",
            "BlockPrefix":["!","#","?","$"],
            "BotUserId":"ここにマイク用ボットIDを設定する",
            "BotName":"🎙VC中継マイク１"
        }
    ],
    "SubBotSettings":[
        {
            "Version": "1.0.0",
            "BotToken": "ここにスピーカー用ボットトークンを設定する",
            "BotId":"speaker_room1",
            "Prefix": "",
            "Slash": "/",
            "BlockPrefix":["!","#","?","$"],
            "BotUserId":"ここにスピーカー用ボットIDを設定する",
            "BotName":"🔊VC中継スピーカー１"
        }
    ],
    "BotStreamJoinFlg": true
}
``` 

### BOT起動
下記のコマンドで起動
```
node index.js
```
起動に成功したらサーバーに招待して下さい。
下記のようにBOTが表示されてればOKです。※アイコンは自分で用意してください。

![image](https://github.com/user-attachments/assets/fc8b48bf-2263-443c-ba26-d5dd057c049c)


### BOTコマンド
| コマンド             | 説明                                                                                           |
|---------------------|------------------------------------------------------------------------------------------------|
| /stm [中継スピーカー接続先VC]               |VC中継ボットを起動し、中継スピーカーをオプションで指定したVCへ接続します。※VCに入ってからこのコマンドを入力して下さい。                   |
| /bye              | BOTがVCから退出します。                                                              |

### 使い方
- 1.このようにVCに入った状態にする。

  ![image](https://github.com/user-attachments/assets/7c74552f-09a7-4974-b0f8-ff66ad3346f5)


- 2.VCに入った状態で、下のように中継先のVCをえらんで/stmを実行する。

  ![image](https://github.com/user-attachments/assets/7f24dab0-50ab-4ae4-83e6-0133cdff89ce)


- 3.下記のように自分のが入っているVCに中継マイクBOTが入り、中継先のVCにVC中継スピーカーが入ります。

  ![image](https://github.com/user-attachments/assets/af19417d-4f3e-4a37-a605-0401b33e596a)

- 4.コマンドを入力したテキストチャンネルには、下記のようにVC中継開始メッセージとVC中継ユーザーリストが表示されます。

  ![image](https://github.com/user-attachments/assets/81495a20-2463-4402-b040-d4963cef382d)

- 5.VC中継ユーザーリストの✅にリアクションすると、リストに自分の名前が追加されます。
  この状態で、VCで話すと中継先のVC（例では、太郎さんがいるVC「ゲーム」）へ自分の声が中継されます。

  ![image](https://github.com/user-attachments/assets/22d83200-f3a9-42ce-b3f9-fffa9da274ee)

- 6.終了する時は、/byeで終了して下さい。

  ![image](https://github.com/user-attachments/assets/e4962309-ea4f-46d1-92c5-ba5a4a23f1a7)



## Special Thanks
このBOTは、下記の記事を参考に作成しました。

https://qiita.com/Mori-chan/items/e9ced87c0d68a9eb2a9a
