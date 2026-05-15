const express = require("express");
const bodyParser = require("body-parser");
const supabaseClient = require("@supabase/supabase-js");
const dotenv = require("dotenv");

const app = express();

dotenv.config();

app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/currency_conversions", async (req, res) => {
  console.log("Getting currency conversions");

  const { data, error } = await supabase
    .from("currency_conversions")
    .select()
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error);
    res.status(500).send(error);
  } else {
    res.json(data);
  }
});

app.post("/currency_conversion", async (req, res) => {
  console.log("Adding currency conversion");

  const amount = req.body.amount;
  const fromCurrency = req.body.from_currency;
  const toCurrency = req.body.to_currency;
  const exchangeRate = req.body.exchange_rate;
  const convertedAmount = req.body.converted_amount;

  const { data, error } = await supabase
    .from("currency_conversions")
    .insert({
      amount: amount,
      from_currency: fromCurrency,
      to_currency: toCurrency,
      exchange_rate: exchangeRate,
      converted_amount: convertedAmount
    })
    .select();

  if (error) {
    console.log(error);
    res.status(500).send(error);
  } else {
    res.json(data);
  }
});

if (require.main === module) {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`App is available on port: ${port}`);
  });
}

module.exports = app;