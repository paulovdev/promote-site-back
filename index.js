const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')('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');

const app = express();
const endpointSecret = 'whsec_jqLnO8OzKJYeYaHrh1W7O2GDvMUNbPyf';
const YOUR_DOMAIN = 'https://quimplo.online';

app.use(cors());

app.use(bodyParser.raw({ type: 'application/json' }));


app.use(express.json());
// Criar sessão de checkout
app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: 'price_1Q1xmWRraDIE2N6qBr7I8ukN',
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${YOUR_DOMAIN}?canceled=true`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Função de atendimento
async function fulfillCheckout(sessionId) {
    console.log('Fulfilling Checkout Session ' + sessionId);

    // Recuperar a sessão de checkout com itens de linha expandidos
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items'],
    });

    // Verificar se o pagamento foi concluído
    if (checkoutSession.payment_status === 'paid') {
        // TODO: Realizar o atendimento dos itens de linha
        // Exemplo: Enviar um e-mail, atualizar inventário, etc.

        // Logar o status do atendimento
        console.log(`Checkout Session ${sessionId} fulfilled.`);
    } else {
        console.log(`Checkout Session ${sessionId} not fulfilled because payment is not completed.`);
    }
}

// Webhook para lidar com eventos
app.post('/webhook', async (request, response) => {
    const payload = request.body;
    const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Lidar com eventos de pagamento
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
        await fulfillCheckout(event.data.object.id);
    }

    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!');
            break;
        case 'payment_intent.payment_failed':
            const paymentFailedIntent = event.data.object;
            console.log('PaymentIntent failed:', paymentFailedIntent.last_payment_error.message);
            // Aqui você pode adicionar lógica adicional para notificar o usuário ou registrar a falha.
            break;
        case 'charge.failed':
            const chargeFailed = event.data.object;
            console.log('Charge failed:', chargeFailed.failure_message);
            // Aqui você pode adicionar lógica para lidar com a falha de cobrança.
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    response.status(200).end();
});


app.get('/check-payment-status', async (req, res) => {
    const { session_id } = req.query;

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        res.json({ status: session.payment_status });
    } catch (error) {
        console.error('Error retrieving checkout session:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(4242, () => console.log('Running on port 4242'));
