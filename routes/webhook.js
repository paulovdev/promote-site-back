const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const stripe = Stripe('sk_test_51Q1x2cRraDIE2N6qLbzeQgMBnW5xSG7gCB6W3tMxCfEWUz8p7vhjnjCAPXHkT2Kr50i6rgAC646BmqglaGWp5dhd00SZi9vWQg');

router.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // Usando o corpo cru do req para construir o evento
    event = stripe.webhooks.constructEvent(req.body, sig, 'whsec_fflHYnGsltO55GQTlPT9HWOssiVKehQy');
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log('Pagamento confirmado:', session);
  }

  res.json({ received: true });
});

module.exports = router;
