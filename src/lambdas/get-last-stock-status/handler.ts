import { APIGatewayProxyEvent } from "aws-lambda";
import type { Logger } from "../../helpers/logger";
import { customLogger } from "../../helpers/logger";
import { getLastStockStatus } from "../../repository/dynamodb";

let logger: Logger = customLogger;

export const getLastStockStatusHandler = async (
  event: APIGatewayProxyEvent
) => {
  logger.info("handler.spyCanyon.start");

  try {
    const type = event.pathParameters?.type;

    if (!type) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing path parameter: type" }),
      };
    }

    const decodedType = decodeURIComponent(type);

    const lastStatus = await getLastStockStatus(decodedType);
    logger.info("handler.getLastStockStatus.success", lastStatus.Items);

    return {
      statusCode: 200,
      body: JSON.stringify(lastStatus.Items),
    };
  } catch (error) {
    throw error;
  }
};
