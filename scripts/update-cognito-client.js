const { execSync } = require('child_process');

const callbackUrls = [
  "http://localhost:3001/auth/callback",
  "http://localhost:5173/admin/auth/callback",
  "http://localhost:5173/auth/callback",
  "http://localhost:5174/admin/auth/callback",
  "http://localhost:5174/auth/callback",
  "https://d3gpcz4ghmzx4n.cloudfront.net/admin/auth/callback",
  "https://d3rk877kxrrv7b.cloudfront.net/admin/auth/callback",
  "https://d3rk877kxrrv7b.cloudfront.net/auth/callback",
  "https://d3rk877kxrrv7b.cloudfront.net/login",
  "https://d3rk877kxrrv7b.cloudfront.net/admin/login",
  "https://d3rk877kxrrv7b.cloudfront.net/admin/dashboard",
  "https://d3rk877kxrrv7b.cloudfront.net/admin",
  "https://d3rk877kxrrv7b.cloudfront.net/"
];

const logoutUrls = [
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://d3gpcz4ghmzx4n.cloudfront.net",
  "https://d3rk877kxrrv7b.cloudfront.net",
  "https://d3rk877kxrrv7b.cloudfront.net/",
  "https://d3rk877kxrrv7b.cloudfront.net/admin",
  "https://d3rk877kxrrv7b.cloudfront.net/admin/dashboard",
  "https://d3rk877kxrrv7b.cloudfront.net/login",
  "https://d3rk877kxrrv7b.cloudfront.net/admin/login"
];

const cmd = `aws cognito-idp update-user-pool-client --user-pool-id ap-southeast-1_RXGKIq89c --client-id 5qeg7to1eroscp415s5jqicvt2 --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_ADMIN_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_SRP_AUTH ALLOW_CUSTOM_AUTH --callback-urls ${callbackUrls.map(u => `"${u}"`).join(' ')} --logout-urls ${logoutUrls.map(u => `"${u}"`).join(' ')} --allowed-o-auth-flows "code" --allowed-o-auth-scopes "openid" "email" "profile" --allowed-o-auth-flows-user-pool-client`;

console.log('Executing Cognito Client update with ALLOW_USER_PASSWORD_AUTH...');
execSync(cmd, { stdio: 'inherit' });
console.log('Cognito User Pool Client explicit auth flows updated successfully!');
