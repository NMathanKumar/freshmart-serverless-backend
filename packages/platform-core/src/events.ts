import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import AWSXRay from 'aws-xray-sdk-core';

export interface DomainEvent<TDetail = unknown> {
  source: string;
  detailType: string;
  detail: TDetail;
  correlationId?: string;
}

export interface EventPublisher {
  publish<TDetail>(event: DomainEvent<TDetail>): Promise<void>;
}

export class EventBridgePublisher implements EventPublisher {
  constructor(
    private readonly busName: string,
    private readonly client = AWSXRay.captureAWSv3Client(new EventBridgeClient({ region: process.env.AWS_REGION }))
  ) {}

  async publish<TDetail>(event: DomainEvent<TDetail>): Promise<void> {
    await this.client.send(
      new PutEventsCommand({
        Entries: [
          {
            EventBusName: this.busName,
            Source: event.source,
            DetailType: event.detailType,
            Detail: JSON.stringify(event.detail)
          }
        ]
      })
    );
  }
}

export class SnsPublisher {
  constructor(
    private readonly topicArn: string,
    private readonly client = AWSXRay.captureAWSv3Client(new SNSClient({ region: process.env.AWS_REGION }))
  ) {}

  async publish<TDetail>(detail: TDetail, subject: string): Promise<void> {
    await this.client.send(
      new PublishCommand({
        TopicArn: this.topicArn,
        Subject: subject,
        Message: JSON.stringify(detail)
      })
    );
  }
}

export class SqsPublisher {
  constructor(
    private readonly queueUrl: string,
    private readonly client = AWSXRay.captureAWSv3Client(new SQSClient({ region: process.env.AWS_REGION }))
  ) {}

  async publish<TDetail>(detail: TDetail): Promise<void> {
    await this.client.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(detail)
      })
    );
  }
}
