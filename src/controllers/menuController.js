const { where } = require('sequelize');
const {sequelize } = require('../config/db')
const { Menus, MenuItems, SubMenus } = require('../models/Menu')

// For menus

 exports.getAllMenus = async (req,res)=>{
    try {

      const menus = await Menus.findAll({
        order:[[ 'name', 'ASC']]
    }) 
    return res.status(200).json({
        data: menus,
        total: menus.length,
        success:true
    });
        
    } catch (error) {

        res.status(500).json({ success: false, message: error.message });
    }
   
}

exports.getMenu = async (req,res)=>{
    const menu = Menus.findByPk(req.params.id, {
        include: [
            {
               model: SubMenus,
               as : 'submenus',
               include:[
                {
                    model : MenuItems,
                    as: 'items',
                }
               ]

            }
        ]
    });
    if(!menu){
        return res.status(404).json({

            success: false,
            message: 'Menu not Found'
        })
    }
    
}

exports.createMenu = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const existing = await Menus.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Menu already exists'
      });
    }

    const menu = await Menus.create({ name, description });
    res.status(201).json({
      success: true,
      message: 'Menu created successfully',
      data: { menu }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const menu = await Menus.findByPk(req.params.id);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }
    await menu.update(req.body);
    res.status(200).json({
      success: true,
      message: 'Menu updated successfully',
      data: { menu }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/menus/:id
exports.deleteMenu = async (req, res) => {
  try {
    const menu = await Menus.findByPk(req.params.id);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    const subMenuCount = await SubMenu.count({ where: { menu_id: menu.id } });
    if (subMenuCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Delete is not performed`
      });
    }

    await menu.destroy();
    res.status(200).json({
      success: true,
      message: 'Menu deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/menus/:menuId/submenus
exports.getAllSubMenus = async (req, res) => {
  try {
    const menu = await Menus.findByPk(req.params.menuId);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    const subMenus = await SubMenus.findAll({
        where:{menu_id : req.params.menuId},
        include: [{
            model : MenuItems,
            as: 'items'
        }],
        order:[['name','ASC']],
    }) 

    res.status(200).json({
        data: subMenus,
        success: true,
        total: subMenus.length

    })
}catch(error){
     res.status(500).json({ success: false, message: error.message });
}
}

exports.getSubMenu = async (req, res)=>{
 try{
    const subMenu = await SubMenus.findByPk(req.params.id ,{
        include:[{
             model : MenuItems,
             as : 'items'
        }],
         
    });
    if(!subMenu){
       return res.status(404).json({
            success:false,
            message : " Menu Not found"
        })
    }

        res.status(200).json({
            success: true,
            data: { subMenu }
            });
        }catch (error) {
            res.status(500).json({ success: false, message: error.message });
       }
    } 

    // POST /api/menus/:menuId/submenus
    exports.createSubMenu = async (req,res)=>{
     try{
        const { name , description, start_time, end_time } = req.body;
         const menu = await Menus.findByPk(req.params.menuId)

         if (!menu){
            return res.status(404).json({
                success: false,
                message: 'Menu not found'
            })
         }

         if(!name){
             return res.status(400).json({
             success: false,
            message: 'Name is required'
      });
    }

  if (start_time && end_time && start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: 'start_time should be less than end_time'
  });
}
     const submenu = await SubMenus.create({
        menu_id : req.params.menuId,
        name,
        description :description || null ,
        start_time,
        end_time
     })
            res.status(201).json({
            success: true,
            message: 'SubMenu created successfully',
            data: { submenu }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
         
    }

        // PUT /api/submenus/:id
    exports.updateSubMenu = async (req, res) => {
    try {
        const submenu = await SubMenus.findByPk(req.params.id);
        if (!submenu) {
        return res.status(404).json({
            success: false,
            message: 'SubMenu not found'
        });
        }
        await submenu.update(req.body);
        res.status(200).json({
        success: true,
        message: 'SubMenu updated successfully',
        data: { submenu }
        });
        } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSubMenu = async (req,res)=>{
    try{
    const submenu = await SubMenus.findByPk(req.params.id)
     if (!submenu) {
      return res.status(404).json({
        success: false,
        message: 'SubMenu not found'
      });
    }
     submenu.destroy();
     res.status(200).json({
        success:true,
        message: 'SubMenu has been deleted'
     })
} catch(error){
     res.status(500).json({ success: false, message: error.message });
}
}

// //Api for Menu Items
exports.getAllItems = async (req,res) => {
    try{
    const submenu = await SubMenus.findByPk(req.params.subMenuId)
    console.log("SUBMENU", submenu);
    if(!submenu){

      return res.status(404).json({
        success: false,
        message: 'SubMenu not found'
      });
    }
        const items= await MenuItems.findAll({
            where : {
               submenu_id : req.params.subMenuId
            },
            order : [[ 'name','ASC']]
        })
         res.status(200).json({
      success: true,
      total: items.length,
      data: { items }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// // GET /api/items/:id
exports.getMenuItem = async (req,res) => {
    try{
    const item = await MenuItems.findByPk(req.params.id,{
        include: [{
            model : SubMenus,
            as : 'submenus',
            attributes: ['id', 'name']

       } ],
  })  // id menuItems table ka 
     
if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    res.status(200).json({
      success: true,
      data: { item }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};  


// // POST /api/submenus/:subMenuId/items
exports.createMenuItem = async (req, res) => {
  try {
    const submenu = await SubMenus.findByPk(req.params.subMenuId);
    if (!submenu) {
      return res.status(404).json({
        success: false,
        message: 'SubMenu not found'
      });
    }

     const { name, description, price, image, is_vegetarian, quantity} = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name aur price required hain'
      });
    }

    const item = await MenuItems.create({
      submenu_id: req.params.subMenuId,
      name,
      description,
      price,
      image,
      is_vegetarian,
      quantity
     
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: { item }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// // PUT /api/items/:id
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItems.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    await item.update(req.body);
    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: { item }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
  

// // DELETE /api/items/:id
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItems.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    await item.destroy();
    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
     res.status(500).json({ success: false, message: error.message });
  }
};

// exports.toggleMenuItem =  async (req, res) => {
//     try{
//     const item = await MenuItems.findByPk(req.param.id)
//     if (!item) {
//       return res.status(404).json({
//         success: false,
//         message: 'Item not found'
//       });
//     }
//     const newStatus = !item.is_available ;

//     await item.update({is_available : newStatus})
//     res.status(200).json({
//         success : true,
//         data : item,
//         message :` Item is now  ${newStatus ? 'Available' : 'Unavailable'}`
//     })

// }catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };




