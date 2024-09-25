const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express();
const stripe = Stripe("sk_test_51Q1x2cRraDIE2N6qLbzeQgMBnW5xSG7gCB6W3tMxCfEWUz8p7vhjnjCAPXHkT2Kr50i6rgAC646BmqglaGWp5dhd00SZi9vWQg"); // Use a variável de ambiente para a chave secreta

// Middleware CORS
app.use(cors());

// Middleware para capturar o corpo bruto da requisição apenas para o webhook
app.use('/api/webhook', express.raw({ type: 'application/json' }));

// Middleware para outros tipos de requisições
app.use(express.json()); // Isso será usado para outras rotas

// Endpoint do Webhook
app.post('/api/webhook', async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const rawBody = req.body; // O corpo bruto é agora capturado pelo middleware express.raw()

  let event;
  try {
    // Aqui, estamos usando o corpo bruto
    event = stripe.webhooks.constructEvent(rawBody, signature, "whsec_fflHYnGsltO55GQTlPT9HWOssiVKehQy"); // Use a variável de ambiente para a chave do webhook
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Lidar com o evento de sessão de checkout completada
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Pagamento confirmado:', session);
    // Aqui você pode marcar o pagamento como confirmado no seu banco de dados
  }

  // Retornar uma resposta ao Stripe
  res.json({ received: true });
});

// Outras rotas ou endpoints da API podem ser definidos aqui
app.post('/api/some-other-endpoint', (req, res) => {
  // Lógica para outro endpoint
  res.json({ message: 'This is another endpoint' });
});

// Iniciar o servidor
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
