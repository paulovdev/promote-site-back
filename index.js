// Importa as dependências necessárias
const stripe = require('stripe')('sk_test_51Q1x2cRraDIE2N6qLbzeQgMBnW5xSG7gCB6W3tMxCfEWUz8p7vhjnjCAPXHkT2Kr50i6rgAC646BmqglaGWp5dhd00SZi9vWQg');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Segredo do webhook
const endpointSecret = 'whsec_fflHYnGsltO55GQTlPT9HWOssiVKehQy.'; // Substitua pelo seu segredo real

// Middleware para analisar JSON em rotas não-webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});

// Endpoint para criar uma sessão de checkout
app.post('/create-checkout-session', async (req, res) => {
  console.log('Received request to create checkout session:', req.body); // Log do corpo da requisição

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Nome do Produto',
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel',
    });

    console.log('Checkout session created successfully:', session);
    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).json({
      error: 'Failed to create checkout session',
    });
  }
});

// Endpoint para o webhook
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  let event;

  // Verifica se o evento veio do Stripe
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`❌ Error message: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Processa o evento recebido
  switch (event.type) {
    case 'identity.verification_session.verified':
      // Todos os cheques de verificação passaram
      const verificationSessionVerified = event.data.object;
      console.log('Verification session verified:', verificationSessionVerified);
      // Adicione sua lógica para lidar com a verificação bem-sucedida aqui
      break;

    case 'identity.verification_session.requires_input':
      // Pelo menos uma verificação falhou
      const verificationSessionRequiresInput = event.data.object;
      console.log('Verification check failed:', verificationSessionRequiresInput.last_error.reason);
      // Adicione sua lógica para lidar com falhas de verificação aqui
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Responde para o Stripe que o evento foi recebido com sucesso
  res.json({ received: true });
});

// Inicia o servidor
app.listen(4242, () => {
  console.log('Running on port 4242');
});
