import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { Logger, customLogger } from "../helpers/logger";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

let logger: Logger = customLogger;
const dynamoTableName = process.env.DYNAMO_TABLE_NAME;

export const putNewStockStatus = async (
  type: string,
  newState: string,
  size: string
) => {
  const command = new PutCommand({
    TableName: dynamoTableName,
    Item: {
      type,
      status: newState,
      date: new Date().toISOString(),
      size,
    },
  });

  const response = await docClient.send(command);
  logger.info("repository.dynamodb.putNewStockStatus", response);
  return response;
};

export const getLastStockStatus = async (bikeType: string) => {
  const command = new QueryCommand({
    TableName: dynamoTableName,
    KeyConditionExpression: "#bicycle_type = :val",
    ExpressionAttributeNames: {
      "#bicycle_type": "type",
    },
    ExpressionAttributeValues: {
      ":val": bikeType,
    },
    ScanIndexForward: false,
    Limit: 1,
  });

  const response = await docClient.send(command);
  logger.info("repository.dynamodb.getLastStockStatus", response);
  return response;
};
