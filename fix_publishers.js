const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'services');
const services = fs.readdirSync(servicesDir);

for (const service of services) {
  const pubPath = path.join(servicesDir, service, 'src', 'events', 'publisher.js');
  if (fs.existsSync(pubPath)) {
    let content = fs.readFileSync(pubPath, 'utf8');
    
    if (content.includes('const EVENT_TYPES = Object.freeze({')) {
      content = content.replace(/const EVENT_TYPES = Object\.freeze\(\{[\s\S]*?\}\);/g, '');
      
      if (content.includes("const { eventPublisher } = require('@freshmart/service-shared');")) {
        content = content.replace(
          "const { eventPublisher } = require('@freshmart/service-shared');",
          "const { eventPublisher, constants } = require('@freshmart/service-shared');\nconst { EVENT_TYPES } = constants;"
        );
      }
      
      fs.writeFileSync(pubPath, content);
      console.log(`Updated ${service}/publisher.js`);
    } else {
        console.log(`Skipped ${service}/publisher.js (no local EVENT_TYPES)`);
    }
  }
}
