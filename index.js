const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Usando a chave secreta

const endpointSecret = process.env.STRIPE_ENDPOINT_KEY; // Usando a chave do endpoint

const port = 3000;

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
                        },
                        unit_amount: 50, // 50 centavos
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:5173/success',
            cancel_url: 'http://localhost:5173/cancel',
        });

        res.json({ id: session.id });
        console.log("Sessão de checkout criada com sucesso");
    } catch (error) {
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Novo endpoint para verificar o status do pagamento
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
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log('Pagamento confirmado:', session);
    }

    res.json({ received: true });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
