const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51Q1x2cRraDIE2N6qLbzeQgMBnW5xSG7gCB6W3tMxCfEWUz8p7vhjnjCAPXHkT2Kr50i6rgAC646BmqglaGWp5dhd00SZi9vWQg');

const endpointSecret = 'whsec_jqLnO8OzKJYeYaHrh1W7O2GDvMUNbPyf';
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

// Create Checkout Session
app.post('/create-checkout-section', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: 'Preço de Quimplo - Template Pass',
                        },
                        unit_amount: 50, // 52 BRL in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:5173/cancel',
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Erro ao criar sessão de checkout:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check Payment Status
app.post('/payment', async (req, res) => {
    const { session_id } = req.body;

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        const isPaid = session.payment_status === 'paid';

        res.json({ isPaid });
    } catch (error) {
        console.error('Erro ao verificar o status do pagamento:', error);
        res.status(500).json({ error: 'Erro ao verificar o status do pagamento' });
    }
});

// Webhooks
app.post('/webhooks', (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log('Pagamento confirmado:', session);
        // Add additional logic such as sending a confirmation email here
    }

    res.json({ received: true });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
