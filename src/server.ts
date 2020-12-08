import { app } from './app';
import { environmentUtil } from './utils/environment.util';

const PORT = environmentUtil.serverPort;

app.listen(PORT, () => {
  console.log(`Ready on http://localhost:${PORT}`);
});
