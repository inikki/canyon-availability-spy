import TelegramBot = require("node-telegram-bot-api");

export class TelegramClient {
  private bot: TelegramBot;

  constructor(
    public botToken: string,
    public userChatId: string
  ) {
    this.bot = new TelegramBot(this.botToken);
  }

  async sendMessage(text: string, notification: boolean = false) {
    await this.bot.sendMessage(this.userChatId, text, {
      disable_notification: notification,
    });
  }
}
