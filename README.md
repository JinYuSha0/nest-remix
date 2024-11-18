# Welcome to nest-remix!

<center>A library that connects remix and nest, use remix as the view layer of nestjs</center>

## How to use

### Nestjs side

```typescript
import { Loader, Action, useAction, useLoader } from "nestjs-remix";

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

export const useIndexLoader = (args: LoaderFunctionArgs) =>
  useLoader(IndexBackend)(args);

export const useIndexAction = (args: ActionFunctionArgs) =>
  useAction(IndexBackend)(args);
```

### Remix side

```typescript
import {
  type IndexBackend,
  useIndexLoader,
  useIndexAction,
} from './server/index.server';
import {
  useActionData,
  useLoaderData,
} from 'nestjs-remix/client';

export const loader: LoaderFunction = (...args) => {
  return useIndexLoader(...args);
};

export const action: ActionFunction = (...args) => {
  return useIndexAction(...args);
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
git clone https://github.com/JinYuSha0/nestjs-remix-template.git
```

## Running the example

```
yarn install
yarn build
yarn run start:dev
```

## Integrate

### 1.Install

```
yarn add nestjs-remix
```

### 2.Inject remix services

```typescript
import { Module } from "@nestjs/common";
import { resolve } from "path";
import { resolveRemixServices } from "nestjs-remix";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    ...resolveRemixServices(resolve("dist/routes/server")),
  ],
})
export class AppModule {}
```

<b>Please note that the path is the path after build, not the source code path.so</b>

### 3. Start nestjs-remix

```typescript
import { startNestRemix } from "nestjs-remix";

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule);
  // ...
  await startNestRemix(app);
  await app.listen(3000);
}
bootstrap();
```

### 4.Modify package.json scripts (Optional)

```json
"scripts": {
    "build": "concurrently \"npm run build:nest\" \"npm run build:remix\" -n \"NEST,REMIX\"",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "cross-env NODE_ENV=development concurrently \"npm run start:dev:nest\" -n \"NEST\"",
    "start:prod": "cross-env NODE_ENV=production node dist/main",
    "build:nest": "rimraf dist && nest build -p tsconfig.nest.json",
    "build:remix": "rimraf build && remix vite:build",
    "start:dev:nest": "rimraf dist && nest start --watch -p tsconfig.nest.json",
    "start:dev:remix": "rimraf build && concurrently \"remix watch\""
  }
```
