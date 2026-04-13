import { Router }          from 'express';
import { requireCustomer } from '../middleware/auth';
import {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
} from '../controller/cart.controller';

const router = Router();

router.get('/',         requireCustomer, getCart);       
router.post('/',        requireCustomer, addToCart);     
router.patch('/:itemId', requireCustomer, updateCartItem);
router.delete('/:itemId',requireCustomer, deleteCartItem);
router.delete('/',       requireCustomer, clearCart);     

export default router;