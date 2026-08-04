// services/auth-service/src/events/post-confirmation.js

const { createAuthService } = require('../service/auth.service');
const { publishUserRegistered } = require('./publisher');
const shared = require('@freshmart/service-shared');
const { ROLES } = shared.constants;

const authService = createAuthService();

/**
 * AWS Cognito Post Confirmation Trigger handler
 * Receives the event directly from AWS Cognito upon successful user registration.
 */
exports.handler = async (event, context) => {
  console.log('Received Post Confirmation Event from Cognito:', JSON.stringify(event, null, 2));

  // Only process if it's a PostConfirmation_ConfirmSignUp event
  if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
    const userAttributes = event.request.userAttributes;
    
    const email = userAttributes.email;
    const name = userAttributes.name || userAttributes.given_name || email;
    const phone = userAttributes.phone_number || null;
    const sub = userAttributes.sub; // Cognito internal ID
    const username = event.userName;

    try {
      // 1. Sync the Profile to DynamoDB
      // We pass the raw claims from Cognito to build the profile payload correctly
      const profileClaims = {
        sub: sub,
        'cognito:username': username,
        email: email,
        name: name,
        phone_number: phone,
        email_verified: userAttributes.email_verified,
        // New signups via Hosted UI are customers by default
        'cognito:groups': [shared.config.auth.cognito.groups.customers] 
      };

      // Since we don't have access to the private `repository.syncProfile` directly here,
      // and the backend register flow relies on it, we can expose a dedicated 
      // `syncCognitoProfile` method on the Auth Service, or we can use the repository directly.
      
      const repository = require('../repositories/auth.repository')();
      
      const payload = {
        userId: sub, // Use Cognito Sub as Primary ID
        cognitoSub: sub,
        username: username,
        name: name,
        email: email,
        phone: phone,
        role: ROLES.CUSTOMER,
        status: 'ACTIVE',
        provider: 'COGNITO',
        groups: profileClaims['cognito:groups'],
        emailVerified: String(userAttributes.email_verified) === 'true',
        phoneVerified: String(userAttributes.phone_number_verified) === 'true',
        mfaEnabled: false,
      };

      console.log('Syncing user profile to DynamoDB:', payload.email);
      const profile = await repository.syncProfile(payload);

      // 2. Publish the EventBridge Event for downstream services (Welcome Email, Analytics, etc.)
      const sanitized = authService.sanitizeUser(profile);
      console.log('Publishing UserRegistered.v1 event for:', sanitized.email);
      
      await publishUserRegistered({ user: sanitized }, { 
        source: 'cognito-post-confirmation' 
      });

      console.log('Post Confirmation processing complete.');
    } catch (error) {
      console.error('Failed to process Post Confirmation Trigger:', error);
      // We do not throw the error here because throwing would fail the Cognito trigger
      // and potentially lock the user out even though they are confirmed in Cognito.
    }
  }

  // Return the event to Cognito to complete the trigger lifecycle
  return event;
};
