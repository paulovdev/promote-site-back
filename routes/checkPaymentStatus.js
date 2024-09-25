const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const stripe = Stripe('sk_test_51Q1x2cRraDIE2N6qLbzeQgMBnW5xSG7gCB6W3tMxCfEWUz8p7vhjnjCAPXHkT2Kr50i6rgAC646BmqglaGWp5dhd00SZi9vWQg');

router.post('/check-payment-status', async (req, res) => {
    const { session_id } = req.body;
    console.log("session_id", session_id)
    if (!session_id) {
        return res.status(400).json({ error: 'session_id é obrigatório.' });
    }

    try {
        console.log("Verificando pagamento com session_id:", session_id);
        const session = await stripe.checkout.sessions.retrieve(session_id);
        const paymentStatus = session.payment_status === 'paid';
        res.json({ isPaid: paymentStatus });
        console.log("Verificação de pagamento concluída:", paymentStatus);
    } catch (error) {
        console.error("Erro ao verificar pagamento:", error);
        res.status(500).json({ error: 'Failed to check payment status' });
    }
});

module.exports = router;
