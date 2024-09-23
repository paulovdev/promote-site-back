const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51Q1x2cRraDIE2N6qLbzeQgMBnW5xSG7gCB6W3tMxCfEWUz8p7vhjnjCAPXHkT2Kr50i6rgAC646BmqglaGWp5dhd00SZi9vWQg'); // Substitua pela sua chave secreta do Stripe

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rota para criar a sessão de checkout
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [{ price: 'price_1Q1ylSRraDIE2N6q1CPEIbBT', quantity: 1 }],
            mode: 'payment',
            // Não inclua as URLs de sucesso e cancelamento
        });
        res.json({ id: session.id });
    } catch (error) {
        console.error('Erro ao criar sessão de checkout:', error);
        res.status(500).send('Erro ao criar sessão de checkout');
    }
});

// Rota para verificar o status do pagamento (se necessário)
app.post('/api/check-payment-status', async (req, res) => {
    const { sessionId } = req.body;

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const paymentConfirmed = session.payment_status === 'paid';

        res.json({ paymentConfirmed });
    } catch (error) {
        console.error('Erro ao verificar o status do pagamento:', error);
        res.status(500).send('Erro ao verificar o status do pagamento');
    }
});

// Inicia o servidor
app.listen(3000, () => console.log('Servidor ouvindo na porta 3000'));
app.get('/', (req, res) => {
    res.send('Servidor ligado!');
});
