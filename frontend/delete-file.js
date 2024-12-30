const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'dashboard', 'AgentDashboard.tsx');

try {
    fs.unlinkSync(filePath);
    console.log(`Successfully deleted ${filePath}`);
} catch (err) {
    console.error(`Error deleting file: ${err}`);
}
