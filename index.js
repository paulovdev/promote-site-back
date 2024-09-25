const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const stripe = require('stripe')('sk_test_51Q1x2cRraDIE2N6qLbzeQgMBnW5xSG7gCB6W3tMxCfEWUz8p7vhjnjCAPXHkT2Kr50i6rgAC646BmqglaGWp5dhd00SZi9vWQg');

const endpointSecret = 'whsec_fflHYnGsltO55GQTlPT9HWOssiVKehQy
';

const port = 3000

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf
    }
}))

app.use(cors())

app.post('/checkout', async (req, res) => {
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

        // Armazene o session_id no sessionStorage
        res.json({ id: session.id });
        console.log("Sessão de checkout criada com sucesso");
    } catch (error) {
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});
app.post('/sub', async (req, res) => {
    const { email, payment_method } = req.body;

    const customer = await stripe.customers.create({
        payment_method: payment_method,
        email: email,
        invoice_settings: {
            default_payment_method: payment_method,
        },
    });

    const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ plan: 'plan_G........' }],
        expand: ['latest_invoice.payment_intent']
    });

    const status = subscription['latest_invoice']['payment_intent']['status']
    const client_secret = subscription['latest_invoice']['payment_intent']['client_secret']

    res.json({ 'client_secret': client_secret, 'status': status });
})

app.post('/webhooks', (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    }
    catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        console.log('Pagamento confirmado:', session);
    }

    res.json({ received: true });
});





app.listen(port, () => console.log(`Example app listening on port ${port}!`))
