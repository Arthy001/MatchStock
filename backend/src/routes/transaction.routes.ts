import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { requireTenant } from '../middlewares/tenant.middleware';

const router = Router();
router.use(requireTenant);

router.get('/transactions', transactionController.getTransactions);
router.get('/balances', transactionController.getBalances);
router.post('/transactions/receive', transactionController.receiveStock);
router.post('/transactions/issue', transactionController.issueStock);
router.post('/transactions/transfer', transactionController.transferStock);
router.post('/transactions/adjust', transactionController.adjustStock);

export default router;
