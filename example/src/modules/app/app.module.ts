import * as path from 'path';
import { RemixModule } from 'nestjs-remix';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import remixServers from '~/routes/server/all.server';

@RemixModule({
  browserBuildDir: path.join(process.cwd(), '/build/client'),
  remixServerDir: path.join(process.cwd(), '/build/server'),
  imports: [],
  controllers: [AppController],
  providers: [AppService, ...remixServers],
})
export class AppModule {}
