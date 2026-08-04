import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DDB_TABLE_WAREHOUSES || 'freshmart-dev-warehouses';

export interface WarehouseEntity {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  operatingHours?: string;
  capacity: {
    maxStorageCapacity: number;
    currentUtilization: number;
    utilizationPercentage: number;
    storageUnit: string; // e.g. pallets, bins, sqft
  };
  zones: Array<{
    zoneId: string;
    zoneName: string;
    type?: string;
  }>;
  defaultReceivingZone?: string;
  defaultDispatchZone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'CLOSED';
  isDeleted: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
  integrationHooks?: {
    supportedOrderTypes?: string[];
    pickupEnabled?: boolean;
    deliveryEnabled?: boolean;
    refrigerationAvailable?: boolean;
    priority?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export class WarehouseRepository {
  /**
   * Keys:
   * PK = WAREHOUSE#<warehouseId>
   * SK = METADATA
   * GSI1: GSI1PK = WAREHOUSE_CODE#<code>, GSI1SK = METADATA
   */

  async createWarehouse(entity: WarehouseEntity): Promise<WarehouseEntity> {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          pk: `WAREHOUSE#${entity.warehouseId}`,
          sk: 'METADATA',
          gsi1pk: `WAREHOUSE_CODE#${entity.warehouseCode.toUpperCase()}`,
          gsi1sk: 'METADATA',
          gsi2pk: 'ALL_WAREHOUSES',
          gsi2sk: `WAREHOUSE#${entity.warehouseId}`,
          ...entity,
        },
        ConditionExpression: 'attribute_not_exists(pk)',
      })
    );
    return entity;
  }

  async getWarehouseById(warehouseId: string): Promise<WarehouseEntity | null> {
    const res = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `WAREHOUSE#${warehouseId}`,
          sk: 'METADATA',
        },
      })
    );
    return (res.Item as WarehouseEntity) || null;
  }

  async getWarehouseByCode(code: string): Promise<WarehouseEntity | null> {
    const res = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'gsi1',
        KeyConditionExpression: 'gsi1pk = :code AND gsi1sk = :sk',
        ExpressionAttributeValues: {
          ':code': `WAREHOUSE_CODE#${code.toUpperCase()}`,
          ':sk': 'METADATA',
        },
        Limit: 1,
      })
    );
    return res.Items && res.Items.length > 0 ? (res.Items[0] as WarehouseEntity) : null;
  }

  async updateWarehouse(warehouseId: string, updates: Partial<WarehouseEntity>): Promise<WarehouseEntity> {
    let updateExpr = 'SET updatedAt = :updatedAt';
    const expAttrVals: Record<string, any> = { ':updatedAt': new Date().toISOString() };
    const expAttrNames: Record<string, string> = {};

    for (const [key, val] of Object.entries(updates)) {
      if (key !== 'warehouseId' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'warehouseCode') {
        const attrKey = `#attr_${key}`;
        const valKey = `:val_${key}`;
        updateExpr += `, ${attrKey} = ${valKey}`;
        expAttrNames[attrKey] = key;
        expAttrVals[valKey] = val;
      }
    }

    const res = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `WAREHOUSE#${warehouseId}`,
          sk: 'METADATA',
        },
        UpdateExpression: updateExpr,
        ExpressionAttributeNames: Object.keys(expAttrNames).length > 0 ? expAttrNames : undefined,
        ExpressionAttributeValues: expAttrVals,
        ReturnValues: 'ALL_NEW',
      })
    );

    return res.Attributes as WarehouseEntity;
  }

  async softDeleteWarehouse(warehouseId: string, deletedBy: string): Promise<WarehouseEntity> {
    const res = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `WAREHOUSE#${warehouseId}`,
          sk: 'METADATA',
        },
        UpdateExpression: 'SET isDeleted = :true, status = :status, deletedAt = :deletedAt, deletedBy = :deletedBy, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':true': true,
          ':status': 'CLOSED',
          ':deletedAt': new Date().toISOString(),
          ':deletedBy': deletedBy,
          ':updatedAt': new Date().toISOString(),
        },
        ReturnValues: 'ALL_NEW',
      })
    );
    return res.Attributes as WarehouseEntity;
  }

  async listWarehouses(limit = 100): Promise<WarehouseEntity[]> {
    // In a real app we would use an index to fetch all WAREHOUSE# entities, or GSI on a fixed partition.
    // Given the single-table design without a generic "TYPE=WAREHOUSE" partition, we can scan or assume GSI2 is configured.
    // We'll map GSI2 to all warehouses for easy listing. Let's use `gsi2pk = 'ALL_WAREHOUSES'` in the insert.
    // For now, let's just do a scan as it's a small master data table.
    
    // Actually, I'll update createWarehouse to write `gsi2pk = 'ALL_WAREHOUSES', gsi2sk = WAREHOUSE#<id>`
    // Wait, let's fix `createWarehouse` and `updateWarehouse` to do this so we can query properly!
    
    const res = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'gsi2',
        KeyConditionExpression: 'gsi2pk = :type',
        ExpressionAttributeValues: {
          ':type': 'ALL_WAREHOUSES',
        },
        Limit: limit,
      })
    );
    return (res.Items || []) as WarehouseEntity[];
  }
}

export const warehouseRepository = new WarehouseRepository();
