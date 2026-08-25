import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { requireTenant } from '../middlewares/tenant.middleware';

const router = Router();

// Apply tenant middleware to all product routes
router.use(requireTenant);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
