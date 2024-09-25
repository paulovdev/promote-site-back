const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const stripe = Stripe('sk_test_51Q1x2cRraDIE2N6qLbzeQgMBnW5xSG7gCB6W3tMxCfEWUz8p7vhjnjCAPXHkT2Kr50i6rgAC646BmqglaGWp5dhd00SZi9vWQg');

// Substitua pela sua chave de webhook
const endpointSecret = 'whsec_...';

// Endpoint do Webhook
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    console.log('Received webhook request:', req.body.toString()); // Log do corpo da requisição

    let event;

    try {
        // Verifique se o evento veio do Stripe
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`❌ Error message: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Verifique o tipo de evento
    switch (event.type) {
        case 'verification_session.verified':
            const verifiedSession = event.data.object;
            console.log('Sessão de verificação verificada:', verifiedSession);
            // Adicione lógica para lidar com a verificação bem-sucedida
            break;
        case 'verification_session.failed':
            const failedSession = event.data.object;
            console.log('Sessão de verificação falhou:', failedSession);
            // Adicione lógica para lidar com a falha na verificação
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Retornar uma resposta ao Stripe
    res.json({ received: true });
});

module.exports = router; // Exporta as rotas
