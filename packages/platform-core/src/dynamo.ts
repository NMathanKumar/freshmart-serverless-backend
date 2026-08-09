import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  type QueryCommandInput,
  UpdateCommand,
  DeleteCommand
} from '@aws-sdk/lib-dynamodb';

export interface TableEntity {
  pk: string;
  sk: string;
  [key: string]: unknown;
}

export const createDocumentClient = () =>
  DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region: process.env.AWS_REGION
    }),
    {
      marshallOptions: {
        removeUndefinedValues: true
      }
    }
  );

export interface QueryOptions {
  beginsWith?: string;
  indexName?: string;
  limit?: number;
  scanIndexForward?: boolean;
  exclusiveStartKey?: Record<string, unknown>;
}

export class DynamoRepository<TItem extends TableEntity> {
  constructor(
    private readonly tableName: string,
    private readonly client = createDocumentClient()
  ) {}

  async put(item: TItem): Promise<TItem> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item
      })
    );
    return item;
  }

  async get(pk: string, sk: string): Promise<TItem | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { pk, sk },
        ConsistentRead: true
      })
    );
    return (result.Item as TItem | undefined) ?? null;
  }

  async query(pk: string, beginsWith?: string): Promise<TItem[]> {
    const result = await this.client.send(new QueryCommand(this.createQueryInput('pk', 'sk', pk, { beginsWith })));
    return (result.Items as TItem[] | undefined) ?? [];
  }

  async queryByIndex(
    indexName: string,
    partitionKeyName: string,
    partitionKeyValue: string,
    sortKeyName?: string,
    options: QueryOptions = {}
  ): Promise<TItem[]> {
    const result = await this.client.send(
      new QueryCommand(this.createQueryInput(partitionKeyName, sortKeyName, partitionKeyValue, { ...options, indexName }))
    );
    return (result.Items as TItem[] | undefined) ?? [];
  }

  async update(
    key: Pick<TItem, 'pk' | 'sk'>,
    expression: string,
    values: Record<string, unknown>,
    names?: Record<string, string>
  ): Promise<void> {
    await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: key,
        UpdateExpression: expression,
        ExpressionAttributeValues: values,
        ExpressionAttributeNames: names
      })
    );
  }

  async delete(pk: string, sk: string): Promise<void> {
    await this.client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { pk, sk }
      })
    );
  }

  private createQueryInput(
    partitionKeyName: string,
    sortKeyName: string | undefined,
    partitionKeyValue: string,
    options: QueryOptions
  ): QueryCommandInput {
    const expressionAttributeValues: Record<string, unknown> = {
      ':pk': partitionKeyValue
    };

    let keyConditionExpression = `${partitionKeyName} = :pk`;
    if (options.beginsWith && sortKeyName) {
      expressionAttributeValues[':sk'] = options.beginsWith;
      keyConditionExpression += ` and begins_with(${sortKeyName}, :sk)`;
    }

    return {
      TableName: this.tableName,
      IndexName: options.indexName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      Limit: options.limit,
      ScanIndexForward: options.scanIndexForward,
      ExclusiveStartKey: options.exclusiveStartKey
    };
  }
}
