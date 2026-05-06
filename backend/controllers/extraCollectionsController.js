import { makeCrudControllers } from './crudFactory.js';

import Attendance from '../models/Attendance.js';
import BeypariSettlement from '../models/BeypariSettlement.js';
import Consignment from '../models/Consignment.js';
import DueAccount from '../models/DueAccount.js';
import DuePayment from '../models/DuePayment.js';
import Expense from '../models/Expense.js';
import FruitType from '../models/FruitType.js';
import Notification from '../models/Notification.js';

// New collections requested from Compass
import Partner from '../models/Partner.js';
import PartnerCopybook from '../models/PartnerCopybook.js';
import Payroll from '../models/Payroll.js';
import ProductReview from '../models/ProductReview.js';
import StockMovement from '../models/StockMovement.js';
import SystemSetting from '../models/SystemSetting.js';

export const attendance = makeCrudControllers(Attendance);
export const beypariSettlements = makeCrudControllers(BeypariSettlement);
export const consignments = makeCrudControllers(Consignment);
export const dueAccounts = makeCrudControllers(DueAccount);
export const duePayments = makeCrudControllers(DuePayment);
export const expenses = makeCrudControllers(Expense);
export const fruitTypes = makeCrudControllers(FruitType);
export const notifications = makeCrudControllers(Notification);

// New exports
export const partners = makeCrudControllers(Partner);
export const partnerCopybooks = makeCrudControllers(PartnerCopybook);
export const payrolls = makeCrudControllers(Payroll);
export const productReviews = makeCrudControllers(ProductReview);
export const stockMovements = makeCrudControllers(StockMovement);
export const systemSettings = makeCrudControllers(SystemSetting);
