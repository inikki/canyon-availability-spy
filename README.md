# Canyon Bike Availibility Spy

Canyon Stock Spy is a serverless application built on AWS Lambda. It monitors the availability of Canyon bikes and notifies users via Telegram when a bike is in stock 🚴‍♀️ This project utilizes AWS Lambda, AWS EventBridge Rules (5 minutes), and the Telegram API to provide timely notifications to users interested in purchasing Canyon bikes.

<img width="369" alt="Screenshot 2024-04-22 at 15 04 06" src="https://github.com/inikki/canyon-availability-spy/assets/16180634/4cd72f18-35e8-49b8-912b-1c3a66a8eb30">

## How to use

### Set Up SSM Parameters

Store your Telegram bot token and user chat ID in AWS Systems Manager (SSM) Parameter Store. Name the parameters `telegram-bot-token` and `telegram-user-chat-id`.

### Update bike URL

Change `ENDURANCE_AL_URL` in configuration to match your desired URL, or add your own.

### Authenticate with AWS

```bash
aws sso login
```

### Deploy the Application

```bash
npm run deploy
```

### EventBridge Rule

The application is set to check every 5 minutes using an AWS EventBridge rule. You can modify the rule to change the frequency of checks to your desired interval.

### Create Telegram Bot

1. Download and open your Telegram application on your mobile device or desktop. Search for @BotFather in the Telegram search bar.
2. Click on the BotFather account and click the "Start" button to begin the conversation.
3. In the chat with BotFather, type or click on /newbot and hit Send.
4. Follow Instructions. You will be prompted to provide a name for your bot.
5. Once you've successfully created the bot, you will receive a message with bot token. Keep your token secure and store it safely, it can be used by anyone to control your bot.
6. Copy your token to .env `TELEGRAM_BOT_TOKEN`.

### How to get Telegram user chat id for private chat or channel

1. Search and open your bot (for private chat) or add Telegram bot into a channel
2. Send a message
3. Go to `https://api.telegram.org/bot{our_bot_token}/getUpdates`
4. Search for `result.0.message.chat.id` or `result.0.channel_post.chat.id`
