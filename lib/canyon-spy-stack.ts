import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamo from "aws-cdk-lib/aws-dynamodb";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ssm from "aws-cdk-lib/aws-ssm";

import { Construct } from "constructs";

export class CanyonSpyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a CloudWatch Events rule
    const rule = new events.Rule(this, "MyRule", {
      schedule: events.Schedule.rate(cdk.Duration.minutes(5)),
    });

    // Dynamo for saving history
    const stockTable = new dynamo.Table(this, "Stock", {
      partitionKey: { name: "type", type: dynamo.AttributeType.STRING },
      sortKey: { name: "date", type: dynamo.AttributeType.STRING },
      billingMode: dynamo.BillingMode.PAY_PER_REQUEST,
    });

    // Ssm params
    const telegramBotToken = ssm.StringParameter.valueFromLookup(
      this,
      "telegram-bot-token"
    );

    const telegramUserChatId = ssm.StringParameter.valueFromLookup(
      this,
      "telegram-user-chat-id"
    );

    // Lambdas
    const spyLambda = new lambda.Function(this, "SpyLambda", {
      environment: {
        DYNAMO_TABLE_NAME: stockTable.tableName,
        ENDURANCE_AL_URL:
          "https://www.canyon.com/en-sk/road-bikes/endurance-bikes/endurace/al/endurace-7/3705.html?dwvar_3705_pv_rahmenfarbe=R074_P05&dwvar_3705_pv_rahmengroesse=XS",
        TELEGRAM_BOT_TOKEN: telegramBotToken,
        TELEGRAM_USER_CHAT_ID: telegramUserChatId,
        TELEGRAM_BOT_NAME: "SpyCanyonStockBot",
        TELEGRAM_BOT_USERNAME: "SpyCanyonBot",
      },
      code: lambda.Code.fromAsset("./dist/lambdas/spy-canyon/"),
      functionName: "lambdaSpy",
      handler: "handler.spyCanyonHandler",
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(300),
    });

    const getLastStockStatusLambda = new lambda.Function(
      this,
      "GetLastStockStatusLambda",
      {
        environment: {
          DYNAMO_TABLE_NAME: stockTable.tableName,
        },
        code: lambda.Code.fromAsset("./dist/lambdas/get-last-stock-status/"),
        functionName: "lambdaGetStatus",
        handler: "handler.getLastStockStatusHandler",
        memorySize: 1024,
        runtime: lambda.Runtime.NODEJS_18_X,
        timeout: cdk.Duration.seconds(300),
      }
    );

    const webhookLambda = new lambda.Function(this, "WebhookLambda", {
      environment: {
        DYNAMO_TABLE_NAME: stockTable.tableName,
      },
      code: lambda.Code.fromAsset("./dist/lambdas/webhook/"),
      functionName: "lambdaWebhook",
      handler: "handler.webhookHandler",
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(300),
    });

    rule.addTarget(new targets.LambdaFunction(spyLambda));
    stockTable.grantReadWriteData(spyLambda);
    stockTable.grantReadWriteData(getLastStockStatusLambda);

    // Create the CloudWatch Logs log group
    const logGroup = new cdk.aws_logs.LogGroup(this, `${id}LogGroup`, {
      logGroupName: `/${id}/logs`,
      retention: cdk.aws_logs.RetentionDays.ONE_WEEK, // Optional: Set retention policy
    });

    // routes
    const api = new apigateway.RestApi(this, "CanyonApi", {
      restApiName: "Canyon Spy Service",
      description: "This service serves stock info.",
      deployOptions: {
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
      cloudWatchRole: true,
    });

    // GET /get-last-stock-status
    const stocks = api.root.addResource("get-last-stock-status");

    const type = stocks.addResource("{type}");
    type.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getLastStockStatusLambda)
    );

    const webhooks = api.root.addResource("webhooks");
    webhooks.addMethod("POST", new apigateway.LambdaIntegration(webhookLambda));

    // Output the API endpoint URL
    new cdk.CfnOutput(this, "ApiEndpoint", {
      value: api.url,
    });

    // Output the Lambda function ARN
    new cdk.CfnOutput(this, "GetLambdaFunctionArn", {
      value: getLastStockStatusLambda.functionArn,
    });
  }
}
