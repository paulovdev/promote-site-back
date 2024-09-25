const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
const bodyParser = require('body-parser');
const webhookRoutes = require('./routes/webhook');

const app = express();
const stripe = Stripe('sk_test_51Q1x2cRraDIE2N6qLbzeQgMBnW5xSG7gCB6W3tMxCfEWUz8p7vhjnjCAPXHkT2Kr50i6rgAC646BmqglaGWp5dhd00SZi9vWQg');

app.use(cors());

// 1st
app.use('/api', express.raw({ type: 'application/json' }), webhookRoutes);

// 2nd for other routes
app.use(express.json());

// Endpoint para criar sessão de checkout
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

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
