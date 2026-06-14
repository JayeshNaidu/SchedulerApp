import { createApp } from "./app.js";
import { config } from "./config.js";

const app = await createApp();

app.listen(config.port, () => {
  console.log(`Appointment demo listening on ${config.publicBaseUrl}`);
});
