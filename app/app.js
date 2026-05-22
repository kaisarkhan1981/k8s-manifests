const express = require("express");
const app = express();
app.get("/", (req, res) => {
  res.send("Hello from ArgoCD deployed app_v2 ðŸš€_v01íº€");
  res.send("Hello from ArgoCD deployed app_v2 ");
});
app.listen(3000, () => console.log("Running on port 3000"));
