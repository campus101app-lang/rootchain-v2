import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();
app.listen(env.PORT, () => {
  console.log(`Rootchain V2 API http://localhost:${env.PORT}/api/v1/health`);
  console.log(`Stellar: ${env.STELLAR_NETWORK}`);
});
