# Welcome to nest-remix!

<center>A library that connects remix and nest, use remix as the view layer of nestjs</center>

## How to use

### Nestjs side
```typescript
import { Loader, Action, useAction, useLoader } from 'nestjs-remix';

@Injectable()
export class IndexBackend {
  constructor(private readonly appService: AppService) {}

  @Loader()
  loader(@Req() req: Request, @Query('name') name?: string,
  ) {
    return this.appService.getHello();
  }

  @Action()
  action(@Body() body: LoginDto) {
    return {};
  }

  @Action.Patch()
  patch() {
    return '[patch]: returned by server side';
  }

  @Action.Delete()
  delete() {
    return '[delete]: returned by server side';
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

## Running the example

```
yarn install
yarn run start:dev
```

## Integrate

### 1.Install

```
yarn install nestjs-remix
```

### 2.Replace Root Module

```typescript
import { RemixModule } from 'nestjs-remix';

@RemixModule({
  publicDir: path.join(process.cwd(), "public"),
  browserBuildDir: path.join(process.cwd(), "build"),
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

|  Property   | Description  | Type | Required |
|  ----  |  ----  |  ----  |  ----  |
| publicDir | Remix frontend build output directory | string | true |
| browserBuildDir | Remix entry build output directory | string | true |
| remixServerDir | Remix backend build output directory | string | true |
| staticDirs | Multiple static file directory configurations | ServeStaticModuleOptions[] | false |
| useCoustomController | Use a custom root path controller | boolean | false |
| isStaticAsset | Determine whether it is a static file | (request: Request) => boolean | false

<b>Except for these new properties, it is no different from the Nestjs module.</b>

### 3. Start nestjs-remix

```typescript
import { startNestRemix } from 'nestjs-remix';

async function bootstrap() {
  // ...
  await app.listen(3000);
  // Must be after the listen method
  startNestRemix(app);
}
bootstrap();
```

### 4.Modify package.json scripts

```json
"scripts": {
    "build": "concurrently \"npm run build:nest\" \"npm run build:remix\" -n \"NEST,REMIX\"",
    "start": "nest start",
    "start:dev": "concurrently \"npm run start:dev:nest\" \"npm run start:dev:remix\" -n \"NEST,REMIX\"",
    "start:prod": "node dist/main",
    "build:nest": "rimraf dist && nest build -p tsconfig.nest.json",
    "build:remix": "rimraf build && nestjs-remix; remix build",
    "start:dev:nest": "rimraf dist && nest start --watch -p tsconfig.nest.json",
    "start:dev:remix": "rimraf build && concurrently \"remix watch\" \"nestjs-remix -w\""
  }
```




