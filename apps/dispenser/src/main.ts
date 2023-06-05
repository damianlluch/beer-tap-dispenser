import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { bootstrap } from '@app/bootstrap';
import { DispenserModule } from './dispenser.module';

let server: Handler;

export const handler: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap(DispenserModule));
  return server(event, context, callback);
};
