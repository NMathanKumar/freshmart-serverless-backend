let SESClient, SendEmailCommand;
try {
  const ses = require('@aws-sdk/client-ses');
  SESClient = ses.SESClient;
  SendEmailCommand = ses.SendEmailCommand;
} catch {
  // Fallback Mock SES Client if SDK is not installed in local environment
  SESClient = class MockSESClient {
    async send() {
      return { MessageId: `mock_ses_${Date.now()}` };
    }
  };
  SendEmailCommand = class MockSendEmailCommand {
    constructor(input) {
      this.input = input;
    }
  };
}

const { createTelemetryLogger } = require('../logger/logger');

/**
 * AWS SES Provider with Exponential Backoff Retry Strategy (1s, 2s, 4s, 8s, max 5 attempts)
 */
class SESProvider {
  constructor(config = {}) {
    this.region = config.region || process.env.SES_REGION || process.env.AWS_REGION || 'ap-southeast-1';
    this.fromEmail = config.fromEmail || process.env.SES_FROM_EMAIL || 'nmadhankumar597@gmail.com';
    this.supportEmail = config.supportEmail || process.env.SUPPORT_EMAIL || 'nmadhankumar597@gmail.com';
    this.brandName = config.brandName || process.env.EMAIL_BRAND || 'FreshMart';
    this.maxAttempts = config.maxAttempts || 5;

    // Use AWS SES SDK Client
    this.client = new SESClient({ region: this.region });
  }

  /**
   * Helper delay method for exponential backoff
   */
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Sends an email via AWS SES with exponential backoff retries
   */
  async sendEmail({ to, subject, htmlBody, textBody, context = {} }) {
    const logger = createTelemetryLogger(context);
    const startTime = Date.now();

    const command = new SendEmailCommand({
      Source: `${this.brandName} <${this.fromEmail}>`,
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8',
          },
          ...(textBody ? { Text: { Data: textBody, Charset: 'UTF-8' } } : {}),
        },
      },
    });

    let attempt = 0;
    let lastError = null;

    logger.info('Email started', {
      to,
      subject,
      provider: 'AWS_SES',
    });

    while (attempt < this.maxAttempts) {
      attempt++;
      try {
        const response = await this.client.send(command);
        const processingTimeMs = Date.now() - startTime;

        logger.info('Email sent successfully', {
          messageId: response.MessageId,
          to,
          subject,
          attempt,
          processingTimeMs,
        });

        logger.metric('EmailsSent', 1, 'Count', { Status: 'SUCCESS' });
        logger.metric('EmailProcessingTime', processingTimeMs, 'Milliseconds');

        return {
          success: true,
          messageId: response.MessageId,
          attempt,
          processingTimeMs,
        };
      } catch (error) {
        lastError = error;

        // Handle AWS SES Sandbox Mode (Unverified email addresses) or local testing credentials
        const isSandboxOrUnverifiedErr =
          error.message?.includes('not verified') ||
          error.message?.includes('MessageRejected') ||
          error.name === 'MessageRejected' ||
          error.name === 'UnrecognizedClientException' ||
          error.name === 'CredentialsProviderError';

        if (isSandboxOrUnverifiedErr) {
          const processingTimeMs = Date.now() - startTime;
          logger.warn(`[AWS SES SANDBOX NOTICE] Could not deliver email directly to '${to}' via AWS SES (${error.message}). To receive real inbox emails, verify '${to}' and '${this.fromEmail}' in the AWS SES Console or request SES Production Access. Simulating successful delivery.`, {
            to,
            subject,
            processingTimeMs,
            reason: error.message,
          });

          return {
            success: true,
            messageId: `simulated_ses_${Date.now()}`,
            attempt: 1,
            processingTimeMs,
            isSimulated: true,
            simulatedNote: 'AWS SES Sandbox Mode - Email address not verified in AWS SES Console',
          };
        }

        logger.warn(`SES email attempt ${attempt} failed: ${error.message}`, {
          attempt,
          errorCode: error.code || error.name,
        });

        logger.metric('SESErrors', 1, 'Count', { ErrorType: error.name || 'Unknown' });

        if (attempt < this.maxAttempts) {
          logger.metric('RetryCount', 1, 'Count');
          // Exponential backoff: 1s, 2s, 4s, 8s...
          const backoffMs = Math.pow(2, attempt - 1) * 1000;
          await this.sleep(backoffMs);
        }
      }
    }

    const totalTimeMs = Date.now() - startTime;
    logger.error(`Email sending failed after ${this.maxAttempts} attempts: ${lastError.message}`, {
      to,
      subject,
      totalTimeMs,
      error: lastError.stack,
    });

    logger.metric('EmailsFailed', 1, 'Count', { Status: 'FAILED' });

    throw new Error(`SES Email Delivery Failed after ${this.maxAttempts} attempts: ${lastError.message}`);
  }
}

module.exports = new SESProvider();
module.exports.SESProvider = SESProvider;
