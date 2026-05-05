const { Orders, OrderItems} = require('../models/Order')
const User = require('../models/User')
const { Model, where } = require('sequelize')
const {sequelize} =require('../config/db');


const { MenuItems } = require('../models/Menu')

exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { items, note } = req.body;

    // ── Validation ────────────────────────────
    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({        
        success: false,
        message: 'Select Atleast One item'
      });
    }

    let total_amount = 0;               
    const orderMenuItems = [];             

    // ── Har item check karo ───────────────────
    for (const item of items) {
      const menuItem = await MenuItems.findByPk(item.menu_item_id);

      if (!menuItem) {
        await t.rollback();
        return res.status(404).json({      // ← return
          success: false,
          message: `Item not found: ${item.menu_item_id}`
        });
      }

      if (!menuItem.is_available) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} not available`
        });
      }

      const price  = parseFloat(menuItem.price);
      const total_price = price * item.quantity;
      total_amount    += total_price;

      orderMenuItems.push({
        menu_item_id: menuItem.id,         
        quantity:     item.quantity,
        price,
        total_price,
      });
    }

    // ── Loop ke BAAD order banao ──────────────
    const order = await Orders.create({     
      user_id: req.user.id,
      total : total_amount,                        
      note,
      status:         'pending',
      payment_status: 'unpaid',
    }, { transaction: t });

    // ── Order items banao ─────────────────────
    const orderItems = orderMenuItems.map(item => ({
      ...item,
      order_id: order.id,
    }));

    await OrderItems.bulkCreate(            // ← orderItems use karo
      orderItems,
      { transaction: t }
    );
    
    console.log("orderItemsData =>", JSON.stringify(orderItems, null, 2));

    await t.commit();

    // ── Poora order fetch karo ────────────────
    const fullOrder = await Orders.findByPk(order.id, {
      include: [{
        model: OrderItems,                  
        as: 'items',
        include: [{
          model: MenuItems,                 
          as: 'menuItem',                 
          attributes: ['id', 'name', 'price'],
        }],
      }],
    });

  return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: { order: fullOrder }
    });

  } catch (error) {
   
  return res.status(500).json({ success: false, message: error.message });
  }
};

// // getOrder accoding to status and pyment status

exports.getAllOrders = async (req,res) =>{
    try{
    const {status, payment_status} = req.query;

    // apply filter when it pass thro query
   const where ={};
    if(status) where.status = status;
    if(payment_status) where.payment_status = payment_status;

    const orders = await Orders.findAll({
        where,
        include:[{
           
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email'],
        
        },
        {
            model: OrderItems,
            as: 'items',
            include: [{
                model:MenuItems,
                as : 'menuItem',
                attributes: ['id','name','price']
            }]
        }],
        order: [['created_at', 'DESC']],
    
    })
    return res.status(200).json({
      success: true,
      total: orders.length,
      data: { orders }
    });
     
    } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

}

// // ── GET MY ORDERS ────────────────────────────
// // GET /api/orders/my  (Customer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Orders.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: OrderItems,
        as: 'items',
        include: [{
          model: MenuItems,
          as: 'menuItem',
          attributes: ['id', 'name', 'price'],
        }],
      }],
      order: [['created_at', 'DESC']],
    });

   return res.status(200).json({
      success: true,
      total: orders.length,
      data: { orders }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// // ── GET ONE ORDER ────────────────────────────
exports.getOrder = async (req, res) => {
  try {
    const order = await Orders.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: OrderItems,
          as: 'items',
          include: [{
            model: MenuItems,
            as: 'menuItem',
            attributes: ['id', 'name', 'price'],
          }],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
     if (req.user.role === 'customer' && order.user_id !== req.user.id){
         return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    return res.status(200).json({
      data: { order},
      success : true,
     })
    } catch(error){
     return res.status(500).json({ success: false, message: error.message });
    }
  }

//   // ── UPDATE ORDER STATUS ──────────────────────
// // Admin/Staff only
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status , payment_status } = req.body;
    const order = await Orders.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Valid transitions
    const validTransitions = {
      pending:   ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready'],
      ready:     ['delivered'],
      delivered: [],
      cancelled: [],
    };
      if(status){
            if (!validTransitions[order.status].includes(status)) {
              return res.status(400).json({
                success: false,
                message: `Cannot change status from "${order.status}" to "${status}"`,
                allowed: validTransitions[order.status],
      });
    }
      }

      const validPayment = ['paid', 'unpaid','failed'];
      if(payment_status && !validPayment.includes(payment_status) ){
         return res.status(400).json({
    success: false,
    message: 'Invalid payment status'
  });
      }

      const updateData ={};
      if(status) updateData.status= status;
      if(payment_status) updateData.payment_status = payment_status;
    

    await order.update(updateData);

  return res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      data: { order }
    });

  } catch (error) {
   return res.status(500).json({ success: false, message: error.message });
  }
};

//  ── CANCEL ORDER ─────────────────────────────
//  Customer cancel kar sakta hai
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Orders.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Sirf apna order cancel kar sakta hai
    if (order.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Sirf pending ya confirmed cancel ho sakta hai
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `"${order.status}" order can not change`
      });
    }

    await order.update({ status: 'cancelled' });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
