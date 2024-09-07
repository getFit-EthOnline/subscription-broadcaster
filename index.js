var cron = require("node-cron");

cron.schedule("*/2 * * * * *", () => {
  console.log("running every 2 seconds");
});
