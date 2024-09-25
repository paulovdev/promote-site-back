const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
const webhookRoutes = require('./routes/webhook');

const app = express();
const stripe = Stripe('sk_test_51Q1x2cRraDIE2N6qLbzeQgMBnW5xSG7gCB6W3tMxCfEWUz8p7vhjnjCAPXHkT2Kr50i6rgAC646BmqglaGWp5dhd00SZi9vWQg'); // Sua chave secreta do Stripe

// Middleware
app.use(cors());
app.use('/api/webhook', express.raw({ type: 'application/json' })); // Middleware para o webhook
app.use('/api', webhookRoutes); // Adiciona as rotas do webhook sob /api

// Rota para criar uma sessão de checkout
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        console.log('Received request to create checkout session');

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
            success_url: 'http://localhost:3000/success', // Ajuste conforme sua rota de sucesso no React
            cancel_url: 'http://localhost:3000/cancel', // Ajuste conforme sua rota de cancelamento no React
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

// Inicia o servidor
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
