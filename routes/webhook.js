const express = require('express');
const Stripe = require('stripe');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const stripe = Stripe('SUA_CHAVE_SECRETA');

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Este middleware deve vir após a configuração do webhook

// Endpoint do Webhook
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        // Aqui, o req.body é o corpo bruto da requisição
        event = stripe.webhooks.constructEvent(req.body, sig, 'whsec_fflHYnGsltO55GQTlPT9HWOssiVKehQy'); // Substitua pela sua chave de webhook
    } catch (err) {
        console.log(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Lidar com o evento de sessão de checkout completada
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Aqui você pode marcar o pagamento como confirmado no seu banco de dados
        console.log('Pagamento confirmado:', session);
    }

    // Retornar uma resposta ao Stripe
    res.json({ received: true });
});

// Iniciar o servidor
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

