const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// TEMP config store — you’ll replace this later with a DB
const CONFIG = {};

app.use(cors());
app.use(bodyParser.json());

// Route to store Yoco keys from config iframe
app.post("/save-config", (req, res) => {
  const { locationId, publicKey, secretKey } = req.body;
  CONFIG[locationId] = { publicKey, secretKey };
  res.send({ status: "saved" });
});

// Route to create Yoco checkout session
app.post("/create-checkout", async (req, res) => {
  const { locationId, amount } = req.body;
  const config = CONFIG[locationId];
  if (!config) return res.status(400).send("Config not found");

  try {
    const response = await axios.post(
      "https://payments.yoco.com/api/checkouts",
      {
        amount: amount,
        currency: "ZAR",
        reference: `order-${Date.now()}`,
        redirectUrl: "https://yourdomain.co.za/thank-you",
      },
      {
        headers: {
          "X-Auth-Secret-Key": config.secretKey,
          "Content-Type": "application/json",
        },
      }
    );
    res.send({ url: response.data.checkoutUrl });
  } catch (err) {
    res.status(500).send("Error creating checkout");
  }
});

// Webhook to receive Yoco payment success
app.post("/webhook", async (req, res) => {
  const event = req.body;
  if (event.eventType === "payment.succeeded") {
    console.log("✅ Payment confirmed:", event.data);
    // Optionally call HL API here
  }
  res.sendStatus(200);
});

// Iframe config page (simple HTML)
app.get("/config", (req, res) => {
  res.send(`
    <html>
      <body>
        <h3>Yoco Config</h3>
        <form method="POST" action="/save-config">
          Location ID: <input name="locationId"/><br/>
          Public Key: <input name="publicKey"/><br/>
          Secret Key: <input name="secretKey"/><br/>
          <button type="submit">Save</button>
        </form>
      </body>
    </html>
  `);
});

// HL install event
app.post("/on-install", (req, res) => {
  const { locationId } = req.body;
  CONFIG[locationId] = {};
  res.send({ status: "installed" });
});

app.listen(PORT, () => console.log(`Server live on ${PORT}`));
