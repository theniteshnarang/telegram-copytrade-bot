import express from "express";
import bodyParser from "body-parser";
import Moralis from "moralis";
import axios from "axios";
import "dotenv/config";
import {
  isValidData,
  shortenAddress,
  getInvolvedAddresses,
  getFilteredData,
} from "./util.js";

const app = express();
app.use(bodyParser.json());
const port = 3000;

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_CHAT_ID = process.env.CHANNEL_CHAT_ID;

await Moralis.start({ apiKey: MORALIS_API_KEY });

console.log({ MORALIS_API_KEY, TELEGRAM_BOT_TOKEN, CHANNEL_CHAT_ID });

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Server ok",
  });
});

function checkAndSendSwapHook(address, fromData, toData) {
  console.log(fromData);
  console.log(toData);
  if (isValidData(fromData, "to") && isValidData(toData, "from"))
    sendHook(address, fromData[0], toData[0]);
}

async function sendHook(address, fromTransfer, toTransfer) {
  const message = `🐋🐋🐋 Whale alert for (${shortenAddress(
    address
  )}) \n \n 🔥 Swapped ${fromTransfer.valueWithDecimals} ${
    fromTransfer.tokenSymbol
  } to ${toTransfer.valueWithDecimals} ${toTransfer.tokenSymbol}`;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: CHANNEL_CHAT_ID,
    text: message,
  };

  try {
    const response = await axios.post(url, payload);
    console.log("Message sent:", response.data);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

app.post("/webhook", async (req, res) => {
  const webhookBody = req.body;
  res.status(200).send();
  if (webhookBody.logs.length > 0 && !webhookBody.confirmed) {
    const decodedLogs = Moralis.Streams.parsedLogs(webhookBody);
    const addresses = getInvolvedAddresses(webhookBody.logs);
    const fromData = getFilteredData(
      webhookBody.erc20Transfers,
      addresses,
      "from"
    );
    const toData = getFilteredData(webhookBody.erc20Transfers, addresses, "to");
    console.log({ decodedLogs, addresses });
    addresses.forEach((address) => {
      checkAndSendSwapHook(address, fromData[address], toData[address]);
    });
  }
});

app.listen(port, () => {
  console.log("Server started listening to port", port);
});
