import * as path from 'path';
import { RemixModule } from 'nestjs-remix';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@RemixModule({
  publicDir: path.join(process.cwd(), 'public'),
  browserBuildDir: path.join(process.cwd(), 'build'),
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
