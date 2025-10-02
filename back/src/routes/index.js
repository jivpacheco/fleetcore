import express from 'express';
import makeRoutes from './makeRoutes.js';

import { requireAuth } from '../middleware/requireAuth.js';
import Person from '../models/Person.js';
import Branch from '../models/Branch.js';
import Location from '../models/Location.js';
import Vehicle from '../models/Vehicle.js';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import StockBalance from '../models/StockBalance.js';
import StockMove from '../models/StockMove.js';
import Reservation from '../models/Reservation.js';
import CycleCount from '../models/CycleCount.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import PurchaseReceipt from '../models/PurchaseReceipt.js';
import PurchaseBill from '../models/PurchaseBill.js';
import Ticket from '../models/Ticket.js';
import WorkOrder from '../models/WorkOrder.js';
import RepairMaster from '../models/RepairMaster.js';
import FailureCode from '../models/FailureCode.js';
import Sequence from '../models/Sequence.js';
import ToolOwnership from '../models/ToolOwnership.js';
import ToolLoan from '../models/ToolLoan.js';
import Accident from '../models/Accident.js';
import SystemConfig from '../models/SystemConfig.js';

// Importa el router dedicado de usuarios
import usersRoutes from './users.routes.js';
import accountRoutes from './account.routes.js'

const api = express.Router();

api.use(requireAuth);
// api.use('/users', makeRoutes(User));
api.use('/users', usersRoutes);
// Cuenta propia (perfil/cambio password)
api.use('/account', accountRoutes)

api.use('/people', makeRoutes(Person));
api.use('/branches', makeRoutes(Branch));
api.use('/locations', makeRoutes(Location));
api.use('/vehicles', makeRoutes(Vehicle));
api.use('/products', makeRoutes(Product));
api.use('/suppliers', makeRoutes(Supplier));
api.use('/stock/balances', makeRoutes(StockBalance));
api.use('/stock/moves', makeRoutes(StockMove));
api.use('/reservations', makeRoutes(Reservation));
api.use('/cycle-counts', makeRoutes(CycleCount));
api.use('/purchase-orders', makeRoutes(PurchaseOrder));
api.use('/purchase-receipts', makeRoutes(PurchaseReceipt));
api.use('/purchase-bills', makeRoutes(PurchaseBill));
api.use('/tickets', makeRoutes(Ticket));
api.use('/workorders', makeRoutes(WorkOrder));
api.use('/repair-master', makeRoutes(RepairMaster));
api.use('/failure-codes', makeRoutes(FailureCode));
api.use('/sequences', makeRoutes(Sequence));
api.use('/tools/ownerships', makeRoutes(ToolOwnership));
api.use('/tools/loans', makeRoutes(ToolLoan));
api.use('/accidents', makeRoutes(Accident));
api.use('/system-config', makeRoutes(SystemConfig));

export default api;