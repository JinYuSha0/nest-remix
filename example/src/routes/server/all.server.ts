import { FooBackend } from './foo.server';
import { IndexBackend } from './index.server';

const servers = [FooBackend, IndexBackend];

export default servers.map((useClass) => ({
  provide: useClass.name,
  useClass,
}));
