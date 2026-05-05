require('dotenv').config();  // ← PEHLI LINE

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const authRoute = require('./routes/authRoute');
const menuRoute = require('./routes/menuRoutes')
const orderRoute = require('./routes/orderRoutes')
const walletRoute = require('./routes/walletRoute')
// const { Menus, SubMenus, MenuItems } = require('./models/Menu');
// const {Wallet} = require('./models/Wallet')
// const { Inventory_history} = require('./models/Inventory_history')



const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/menu', menuRoute);
app.use('/api/orders',orderRoute);
app.use('/api/wallet',walletRoute);


app.get('/', (req, res) => {
  res.json({ message: 'server is running' });
});

const PORT = process.env.PORT || 3000;



const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
  });
};

start();