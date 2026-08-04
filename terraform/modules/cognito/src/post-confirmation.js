const { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand } = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient({});

exports.handler = async (event) => {
    console.log("Cognito Post Confirmation Trigger Event:", JSON.stringify(event, null, 2));

    const userPoolId = event.userPoolId;
    const userName = event.userName;

    // Set custom:profile attribute to 'customer'
    const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: userPoolId,
        Username: userName,
        UserAttributes: [
            {
                Name: "custom:profile",
                Value: "customer"
            }
        ]
    });

    try {
        await client.send(command);
        console.log(`Successfully set custom:profile=customer for user ${userName}`);
    } catch (err) {
        console.error("Error updating user attributes:", err);
    }

    return event;
};
