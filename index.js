const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mercadopago = require('mercadopago');

mercadopago.configure({
    access_token: 'APP_USR-8159512654439925-092520-95d69b3eb71e8761564ab61c7142ff90-1173126623' // Substitua pelo seu Access Token
});

const port = process.env.PORT || 3000;

// parse application/json
app.use(bodyParser.json());
app.use(cors());

app.post('/checkout', async (req, res) => {
    const { siteName, description, price } = req.body; // Extraia informações do corpo da requisição

    const preference = {
        items: [
            {
                title: siteName,
                description: description,
                quantity: 1,
                currency_id: 'BRL',
                unit_price: price,
            }
        ],
        back_urls: {
            success: 'http://quimplo.online/success',
            failure: 'http://localhost:5173/cancel',
            pending: 'http://localhost:5173/pending',
        },
        auto_return: 'approved',
    };

    try {
        const response = await mercadopago.preferences.create(preference);
        res.json({ init_point: response.body.init_point });
    } catch (error) {
        console.error('Erro ao criar preferência:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
