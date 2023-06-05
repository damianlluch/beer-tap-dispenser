import { NestFactory } from "@nestjs/core";
import {
  APIGatewayEventRequestContext,
  APIGatewayProxyWithCognitoAuthorizerEvent,
  Handler,
} from "aws-lambda";
import { Request, json } from "express";
import serverless from "serverless-http";
import "source-map-support/register";

export async function bootstrap(module: any): Promise<Handler> {
  const app = await NestFactory.create(module);
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverless(expressApp, {
    request: async function (
      req: Request & { requestContext: APIGatewayEventRequestContext },
      event: APIGatewayProxyWithCognitoAuthorizerEvent
    ) {
      console.log(
        "RequestContext",
        JSON.stringify(event.requestContext, null, 2)
      );
    },
  });
}
