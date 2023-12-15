export { useLoaderData, useActionData } from "./client";

declare global {
  namespace Express {
    interface Request {
      handleByRemix?: boolean;
    }
  }

  interface Request extends Express.Request {}

  interface Response extends Express.Response {}
}
