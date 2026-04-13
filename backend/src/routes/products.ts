import { Router } from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductById,
  getTaxonomy,
} from '../controller/product.controller';

const router = Router();

router.get('/taxonomy/all', getTaxonomy);        
router.get('/featured',     getFeaturedProducts); 
router.get('/',             getProducts);         
router.get('/:id',          getProductById);      

export default router;
