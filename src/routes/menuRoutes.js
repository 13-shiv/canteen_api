const router = require('express').Router();
const menuController = require('../controllers/menuController')
const { authenticate, authorize } = require('../middleware/auth')

const admin      = [authenticate, authorize(['admin'])];
const adminStaff = [authenticate, authorize(['admin', 'staff'])];

// ── TABLE 1: MENUS ────────────────────────────
router.get('/',        menuController.getAllMenus);
router.get('/:id',     menuController.getMenu);
router.post('/createMenu',       ...admin, menuController.createMenu);
router.put('/update/:id',     ...admin, menuController.updateMenu);
router.delete('/:id',  ...admin, menuController.deleteMenu);

// table : SubMenus
router.get('/:menuId/getAll',     menuController.getAllSubMenus);
router.get('/:id/submenu',         menuController.getSubMenu);
router.post('/:menuId/createSubMenu',    ...admin, menuController.createSubMenu);
router.put('/:id/updateSubmenus',         ...admin, menuController.updateSubMenu);
router.delete('/deleteSubmenu/:id',      ...admin, menuController.deleteSubMenu);

// //table :Menuitems
router.get('/items/:subMenuId',   menuController.getAllItems);
router.get('/items/:id',                  menuController.getMenuItem);
router.post('/:subMenuId/createItems',  ...adminStaff, menuController.createMenuItem);
router.put('/items/:id',                   ...adminStaff, menuController.updateMenuItem);
router.delete('/items/:id',                ...admin, menuController.deleteMenuItem);
// router.patch('/items/:id/toggle',          ...adminStaff, menuController.toggleMenuItem);

module.exports = router;
