const express = require('express');
const Stripe = require('stripe');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const stripe = Stripe('sk_test_51Q1x2cRraDIE2N6qLbzeQgMBnW5xSG7gCB6W3tMxCfEWUz8p7vhjnjCAPXHkT2Kr50i6rgAC646BmqglaGWp5dhd00SZi9vWQg');

// Middleware
app.use(cors());

// Middleware para capturar o corpo bruto da requisição
app.use(
  express.raw({ 
    type: 'application/json', 
    // Salvar o corpo bruto na requisição
    verify: (req, res, buf) => {
      req.rawBody = buf.toString(); 
    }
  })
);

// Endpoint do Webhook
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // Usando req.rawBody para verificar a assinatura
    event = stripe.webhooks.constructEvent(req.rawBody, sig, 'whsec_fflHYnGsltO55GQTlPT9HWOssiVKehQy');
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Lidar com o evento de sessão de checkout completada
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Aqui você pode marcar o pagamento como confirmado no seu banco de dados
    console.log('Pagamento confirmado:', session);
  }

  // Retornar uma resposta ao Stripe
  res.json({ received: true });
});

// Iniciar o servidor
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
