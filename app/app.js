const express = require("express");
const app = express();
app.get("/", (req, res) => {
  res.send("Hello from ArgoCD deployed app_v2 ðŸš€íº€");
});
app.listen(3000, () => console.log("Running on port 3000"));
