import axios from "axios";
import * as https from "https";
import { load } from "cheerio";
import { TelegramClient } from "../../adapter/telegram/adapter";
import { customLogger } from "../../helpers/logger";
import { putNewStockStatus } from "../../repository/dynamodb";

import type { Logger } from "../../helpers/logger";
import { BikeSize, CanyonTypes } from "../../enum";
import { config } from "../../helpers/bike-config";

let logger: Logger = customLogger;

let telegramClient: TelegramClient;
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const userChatId = process.env.TELEGRAM_USER_CHAT_ID;

export const spyCanyonHandler = async (): Promise<void> => {
  logger.info("handler.spyCanyon.start");

  try {
    // get XS size
    const { al } = config(BikeSize.XS);

    // Get axios response
    const httpsAgent = new https.Agent({
      secureProtocol: "TLSv1_2_method", //
    });

    const response = await axios.get(al.url, { httpsAgent });
    logger.info("handler.spyCanyon.axios.getResponse");
    const html = response.data;

    // Load html with cherrio
    const $ = load(html);
    logger.info("handler.spyCanyon.cherrio.loadHtml");

    // find XS purchasable status
    const searchingSize = $(
      `.productConfiguration__selectVariant[data-product-size='${al.size}']`
    );

    const isUnpurchasable =
      searchingSize[0].attribs.class.includes("unpurchasable");
    logger.info("handler.spyCanyon.cheerio.isUnpurchasable", isUnpurchasable);

    // Update stock status and send Telegram messages accordingly
    const result = await putNewStockStatus(
      CanyonTypes.canyonEnduranceAl,
      isUnpurchasable ? "Not in stock" : "In stock",
      al.size
    );
    logger.info(
      `handler.putNewStockStatus.${isUnpurchasable ? "notInStock" : "inStock"}.success`,
      result.$metadata.httpStatusCode
    );

    telegramClient = new TelegramClient(botToken, userChatId);
    if (isUnpurchasable) {
      // this is for test purposes
      // await telegramClient.sendMessage(
      //   "Canyon AL is still not in stock, sorry :(",
      //   true
      // );
      logger.info("handler.telegramClient.doNotSendMessage.notInStock.success");
    } else {
      await telegramClient.sendMessage(
        `Canyon AL is in stock. Go and buy! This is the link: ${al.url}`
      );
      logger.info("handler.telegramClient.sendMessage.success");
    }
  } catch (error) {
    logger.error("handler.error", error);
    throw error;
  }
};
