import { Router }          from 'express';
import { requireCustomer } from '../middleware/auth';
import {
  checkout,
  getOrders,
  getOrderById,
} from '../controller/order.controller';

const router = Router();

router.post('/checkout', requireCustomer, checkout);     
router.get('/',          requireCustomer, getOrders);    
router.get('/:id',       requireCustomer, getOrderById);  

export default router;
