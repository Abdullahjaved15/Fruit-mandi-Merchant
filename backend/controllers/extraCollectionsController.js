import { makeCrudControllers } from './crudFactory.js';

import StockMovement from '../models/StockMovement.js';
import SystemSetting from '../models/SystemSetting.js';

export const stockMovements = makeCrudControllers(StockMovement);
export const systemSettings = makeCrudControllers(SystemSetting);
