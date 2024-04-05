import { APIGatewayProxyEvent } from "aws-lambda";
import type { Logger } from "../../helpers/logger";
import { customLogger } from "../../helpers/logger";

let logger: Logger = customLogger;

export const webhookHandler = async (event: APIGatewayProxyEvent) => {
  logger.info("handler.webhookHandler.start");

  try {
    logger.info("handler.webhookHandler.input", event);

    return {
      statusCode: 200,
      body: JSON.stringify(event.body),
    };
  } catch (error) {
    throw error;
  }
};
