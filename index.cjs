// server/server.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Simulando um armazenamento em memória para os pagamentos (pode ser substituído por um banco de dados)
const paymentRecords = {}; // Armazenamento em memória para simulação

// Rota para criar a sessão de checkout
app.post('https://promote-site-back.vercel.app//create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: 'price_1Q1ylSRraDIE2N6q1CPEIbBT',
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/cancel`,
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota do webhook
app.post('https://promote-site-back.vercel.app//api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Adicione sua chave de webhook aqui
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Error verifying webhook signature:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Lida com o evento do checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Aqui você pode armazenar o status do pagamento
    paymentRecords[session.id] = {
      paid: true,
      email: session.customer_email, // Exemplo de armazenamento de dados
      // Outros dados do pagamento podem ser armazenados aqui
    };

    console.log('Pagamento concluído com sucesso:', session);
  }

  // Retorna uma resposta para o Stripe
  res.json({ received: true });
});

// Rota para verificar o status do pagamento
app.get('https://promote-site-back.vercel.app//api/check-payment-status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const paymentStatus = paymentRecords[sessionId] || { paid: false };
  res.json(paymentStatus);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.get('/', (req, res) => {
    res.send('Servidor ligado!');
});
