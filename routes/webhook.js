const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const stripe = Stripe('sk_test_51Q1x2cRraDIE2N6qLbzeQgMBnW5xSG7gCB6W3tMxCfEWUz8p7vhjnjCAPXHkT2Kr50i6rgAC646BmqglaGWp5dhd00SZi9vWQg');

// Endpoint do Webhook
router.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        // O corpo da requisição deve ser bruto (não analisado)
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

module.exports = router; // Exporta as rotas
