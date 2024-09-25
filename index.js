const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
const webhookRoutes = require('./routes/webhook');

const app = express();
const stripe = Stripe('sk_test_51Q1x2cRraDIE2N6qLbzeQgMBnW5xSG7gCB6W3tMxCfEWUz8p7vhjnjCAPXHkT2Kr50i6rgAC646BmqglaGWp5dhd00SZi9vWQg');

// Middleware
app.use(cors());
app.use(express.json()); // Middleware para processar JSON

// Usar as rotas do webhook
app.use('/api/webhook', webhookRoutes); // A rota para o webhook

// Rota para criar uma sessão de checkout
app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'PIROCA',
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

        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Inicia o servidor
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
