// back/src/routes/index.js
import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

import makeRoutes from './makeRoutes.js';

// Modelos usados por makeRoutes (genéricos)
import Branch from '../models/Branch.js';
import Location from '../models/Location.js';
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

// Rutas dedicadas (custom)
import usersRoutes from './users.routes.js';
import accountRoutes from './account.routes.js';
import vehiclesRoutes from './vehicles.routes.js';
import catalogsRoutes from './catalogs.routes.js';

import peopleRoutes from './people.routes.js';
import peopleMediaRoutes from './peopleMedia.routes.js';
import branchMediaRoutes from './branchMedia.routes.js';
import rolesRoutes from './roles.routes.js';
import permissionsRoutes from './permissions.routes.js';
import positionsRoutes from './positions.routes.js';

const api = express.Router();
api.use(requireAuth);

// Custom routes
api.use('/users', usersRoutes);
api.use('/account', accountRoutes);
api.use('/vehicles', vehiclesRoutes);
api.use('/catalogs', catalogsRoutes);

api.use('/roles', rolesRoutes);
api.use('/permissions', permissionsRoutes);
api.use('/positions', positionsRoutes);

// ✅ RRHH custom: NO uses makeRoutes(Person)
api.use('/people', peopleRoutes);

// ✅ Media RRHH montado donde corresponde
api.use('/people/:personId/media', peopleMediaRoutes);

// ✅ Media Sucursales (fachada + documentos)
api.use('/branches/:branchId/media', branchMediaRoutes);

// Generic routes
api.use('/branches', makeRoutes(Branch));
api.use('/locations', makeRoutes(Location));
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
