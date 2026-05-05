const User = require('../models/User');
const WalletTransaction = require('../models/Wallet');
const {sequelize} = require('../config/db'); 
const  { MenuItems } = require('../models/Menu');
const {Orders, OrderItems} = require('../models/Order')
const InventoryHistory = require('../models/InventoryHistory');


// only admin and supervisor do the recharge
exports.topup = async (req,res)=>{
    const t = await sequelize.transaction();
    try {
        
        const { user_id, amount, description } = req.body;
        if(!user_id || !amount){
            await t.rollback();
            return res.status(400).json({
            success: false,
            message: 'user_id and amount are required'
        })
    }
       if(amount <= 0){
        await t.rollback(); 
        return res.status(400).json({
            success: false,
            message: 'Amount sholud be greater than 0'
         })
       }
       const customer = await User.findByPk(user_id, {transaction : t});
       if(!customer){
        await t.rollback();
        return res.status(404).json({
            success: false,
            message: 'Customer Not exist'
         })
       }
       if(customer.role !== 'customer'){
        await t.rollback();
          return res.status(400).json({
            success: false,
            message: 'Only customer can recharge'
         })
       }
       const balance_before = parseFloat(customer.wallet_balance);
       const balance_after = balance_before + parseFloat(amount) ;

       await customer.update(
       { wallet_balance : balance_after },
        {transaction : t} 
       );

       // transaction create
       await WalletTransaction.create({
        user_id,
        type: 'credit',
        amount,
        balance_before,
        balance_after,
        description : description || `added by ${req.user.role}`,
        done_by : req.user.id,

       },{transaction:  t})

       await t.commit();

        res.status(200).json({
        success: true,
        message: `${amount} is added in wallet `,
        data: {
        customer_name:   customer.name,
        amount_added:    amount,
        balance_before,
        balance_after,
      }
    });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ success: false, message: error.message });
    }

    
}

// // Get balance of customer from user table
// exports.getBalance = async (req, res) => {
//   try {
//     const user = await User.findByPk(req.user.id, {
//       attributes: ['id', 'name', 'email', 'wallet_balance'],
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         name:           user.name,
//         wallet_balance: user.wallet_balance,
//       }
//     });
//     } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// }

// // GET  All WALLET TRANSACTIONS
// exports.getAllTransactions = async (req,res) =>{
//     try {
//         const user_id = req.user.role === 'customer' ? req.user.id : req.query.user_id || req.user.id ;
     
//         const tranastions = await WalletTransaction.findAll({
//             where :{user_id},
//             order :[['created_at', 'DESC']],
//             include:
//             [{
//                 model:'User',
//                 as : 'customer',
//                 attributes : [id ,'name','email'],
//             }]
//         })
//         return res.status(200).json({
//             success : true,
//             total : tranastions.length,
//             data: {tranastions}
//         })
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }
//  // PAY ORDER ─ For Counter + Supervisor + Admin
//  exports.payOrder = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { order_id } = req.body;

//     // search Order
//     const order = await Orders.findByPk(order_id, {
//       include: [{
//         model: OrderItem,
//         as:    'items',
//         include: [{
//           model:      MenuItems,
//           as:         'menuItem',
//           attributes: ['id', 'name', 'price', 'quantity'],
//         }],
//       }],
//     });

//     if (!order) {
//       await t.rollback();
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       });
//     }

//     // Already paid?
//     if (order.payment_status === 'paid') {
//       await t.rollback();
//       return res.status(400).json({
//         success: false,
//         message: 'Order already paid hai'
//       });
//     }
//      // Customer ka wallet check karo
//     const customer = await User.findByPk(order.user_id, { transaction: t });
//     const balance  = parseFloat(customer.wallet_balance);
//     const total    = parseFloat(order.total_amount);

//     if (balance < total) {
//       await t.rollback();
//       return res.status(400).json({
//         success: false,
//         message: `Insufficient balance! Balance: ₹${balance}, Required: ₹${total}`
//       });
//     }

//     // ── 1. Wallet se balance cut karo ────────
//     const balance_before = balance;
//     const balance_after  = balance - total;

//     await customer.update(
//       { wallet_balance: balance_after },
//       { transaction: t }
//     );

//      // ── 2. Wallet transaction record ─────────
//     await WalletTransaction.create({
//       user_id:        order.user_id,
//       type:           'debit',
//       amount:         total,
//       balance_before,
//       balance_after,
//       description:    `Payment for Order #${order.id}`,
//       order_id:       order.id,
//       done_by:        req.user.id,
//     }, { transaction: t });

//     // ── 3. Order payment_status update ───────
//     await order.update(
//       { payment_status: 'paid' },
//       { transaction: t }
//     );

//     // ── 4. Inventory update karo ──────────────
//     for (const item of order.items) {
//       const menuItem       = item.menu_item;
//       const qty_before     = menuItem.quantity;
//       const qty_changed    = item.quantity;
//       const qty_after      = qty_before - qty_changed;

//        // Quantity update
//       await MenuItem.update(
//         { quantity: qty_after },
//         { where: { id: menuItem.id }, transaction: t }
//       );

//       // Inventory history record
//       await InventoryHistory.create({
//         menu_item_id:     menuItem.id,
//         type:             'deduct',
//         quantity_before:  qty_before,
//         quantity_changed: qty_changed,
//         quantity_after:   qty_after,
//         description:      `Order #${order.id} payment`,
//         order_id:         order.id,
//         done_by:          req.user.id,
//       }, { transaction: t });
//     }
//     await t.commit();

//     res.status(200).json({
//       success: true,
//       message: 'Payment successful!',
//       data: {
//         order_id:        order.id,
//         total_paid:      total,
//         balance_before,
//         balance_after,
//         payment_status: 'paid',
//       }
//     });
//     } catch (error) {
//     await t.rollback();
//     res.status(500).json({ success: false, message: error.message });
//   }
// };