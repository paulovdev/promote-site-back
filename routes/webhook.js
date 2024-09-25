const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const stripe = Stripe('sk_test_51Q1x2cRraDIE2N6qLbzeQgMBnW5xSG7gCB6W3tMxCfEWUz8p7vhjnjCAPXHkT2Kr50i6rgAC646BmqglaGWp5dhd00SZi9vWQg');

// Middleware para receber o corpo da requisição como raw
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    console.log("Recebendo evento do Stripe..."); // Log para indicar que um evento está sendo recebido
    console.log("Stripe Signature:", sig); // Log da assinatura do Stripe

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, 'whsec_fflHYnGsltO55GQTlPT9HWOssiVKehQy');
        console.log("Evento construído com sucesso:", event); // Log para verificar o evento construído
    } catch (err) {
        console.log(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manipula o evento
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        console.log('Pagamento confirmado:', session); // Log para mostrar os dados da sessão de checkout
        // Aqui você pode também armazenar em um banco de dados se necessário
    } else {
        console.log(`Evento não tratado: ${event.type}`); // Log para eventos não tratados
    }

    // Responde ao Stripe com sucesso
    res.json({ received: true });
});

module.exports = router;
