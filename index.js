// server.js
const express = require('express');
const { json } = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4242;

app.use(cors());
app.use(json());

app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body; // Certifique-se de que o valor está em centavos

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd', // ou a moeda que você estiver usando
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post('/check-payment-status', async (req, res) => {
  const { session_id } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(session_id);
    res.send({ isPaid: paymentIntent.status === 'succeeded' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
