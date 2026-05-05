require('dotenv').config();  // ← PEHLI LINE

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/db');
const authRoute = require('./src/routes/authRoute');
const menuRoute = require('./src/routes/menuRoutes')
const orderRoute = require('./src/routes/orderRoutes')
const walletRoute = require('./src/routes/walletRoute')
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
  try {
    await connectDB();
    console.log("✅ DB connected");
  } catch (error) {
    console.error("❌ DB failed but server starting:", error);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

start();