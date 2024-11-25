# Welcome to nest-react-router!

<div align="center">
<a href="https://www.npmjs.com/package/nest-react-router"><img src="https://img.shields.io/npm/v/nest-react-router.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/nest-react-router"><img src="https://img.shields.io/npm/l/nest-react-router.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/package/nest-react-router"><img src="https://img.shields.io/npm/dm/nestjs-remix.svg" alt="NPM Downloads" /></a>
</div>

<center>A library that connects nest and react-router v7, use react-router as the view layer of nest</center>

## Migrated to react-route v7

Now this repository has been migrated to react-router v7 by releasing the new library [nest-react-router](https://www.npmjs.com/package/nest-react-router), <b style="color: red;">nestjs-remix will be maintained synchronously for a period of time and will be completely deprecated in the future</b>, you can continue to use nestjs-remix, but please note that there are some minor changes.

### request flag

| before        | after               |
| ------------- | ------------------- |
| handleByRemix | handleByReactRouter |
| remixArgs     | reactRouterArgs     |
| remixParams   | reactRouterParams   |

### decorator

| before    | after           |
| --------- | --------------- |
| RemixArgs | ReactRouterArgs |

## How to use

### Nest side

```typescript
import { Loader, Action, useServer } from "nest-react-router";

@Injectable()
export class IndexBackend {
  constructor(private readonly appService: AppService) {}

  @Loader()
  loader(@Req() req: Request, @Query("name") name?: string) {
    return this.appService.getHello();
  }

  @Action()
  action(@Body() body: LoginDto) {
    return {};
  }

  @Action.Patch()
  patch() {
    return "[patch]: returned by server side";
  }

  @Action.Delete()
  delete() {
    return "[delete]: returned by server side";
  }
}

export const useIndexServer = useServer(IndexBackend);
```

### react-router side

```typescript
import {
  type IndexBackend,
  useIndexServer,
} from './server/index.server';
import {
  useActionData,
  useLoaderData,
} from 'nest-react-router/client';

export const loader: LoaderFunction = (args) => {
  return useIndexServer(args);
};

export const action: ActionFunction = (args) => {
  return useIndexServer(args);
};

export default function Index() {
  const data = useLoaderData<IndexBackend>();
  const actionData = useActionData<IndexBackend>();
  return <div>{data.message}</div>
}
```

<b>For more detailed usage, please refer to Example</b>

## Quick Start

```
git clone https://github.com/JinYuSha0/nest-remix.git
```

## Running the example

```
yarn install
yarn run start:dev
```

## Integrate

### 1.Install

```
yarn add nest-react-router
```

### 2.Inject react-router services

```typescript
import { Module } from "@nestjs/common";
import { resolve } from "path";
import { resolveReactRouterServices } from "nest-react-router";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    ...resolveReactRouterServices(resolve("dist/routes/server")),
  ],
})
export class AppModule {}
```

<b>Please note that the path is the path after build, not the source code path</b>

### 3. Start nest-react-router

```typescript
import { startNestReactRouter } from "nest-react-router";

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);
  // ...
  await startNestReactRouter(app);
  await app.listen(3000);
}
bootstrap();
```

### 4.Modify package.json scripts (Optional)

```json
"scripts": {
    "build": "concurrently \"npm run build:nest\" \"npm run build:react-router\" -n \"NEST,REACT-ROUTER\"",
    "start": "nest start",
    "start:dev": "cross-env NODE_ENV=development concurrently \"npm run start:dev:nest\" -n \"NEST\"",
    "start:prod": "cross-env NODE_ENV=production node dist/main",
    "build:nest": "rimraf dist && nest build -p tsconfig.nest.json",
    "build:react-router": "rimraf build && react-router build",
    "start:dev:nest": "rimraf dist && nest start --watch -p tsconfig.nest.json"
  }
```
