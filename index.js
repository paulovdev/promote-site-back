const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')("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");

const endpointSecret = "whsec_fflHYnGsltO55GQTlPT9HWOssiVKehQy";

const port = process.env.PORT || 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

app.use(cors());

app.post('/checkout', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: 'Preço de Quimplo - Template Pass',
                            description: 'Template premium para seu site',
                        },
                        unit_amount: 50,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://quimplo.online/success',
            cancel_url: 'http://localhost:5173/cancel',
        });

        console.log('Sessão de checkout criada:', session);
        res.json({ id: session.id });
    } catch (error) {
        console.error('Erro ao criar sessão de checkout:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/check-payment-status', async (req, res) => {
    const { session_id } = req.body;

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        const isPaid = session.payment_status === 'paid';

        res.json({ isPaid });
    } catch (error) {
        console.error("Erro ao verificar o status do pagamento:", error);
        res.status(500).json({ error: 'Erro ao verificar o status do pagamento' });
    }
});

app.post('/webhooks', (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log('Pagamento confirmado:', session);
    }

    res.json({ received: true });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
