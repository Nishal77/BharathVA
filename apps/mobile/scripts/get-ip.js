#!/usr/bin/env node

// Get Development Machine IP Address
// This script helps you find your machine's IP address for mobile development

const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return null;
}

function main() {
  console.log('🔍 Finding your development machine\'s IP address...\n');
  
  const ip = getLocalIPAddress();
  
  if (ip) {
    console.log('✅ Found your IP address:');
    console.log(`   ${ip}\n`);
    
    console.log('📱 For mobile development:');
    console.log(`   Update apps/mobile/services/api/environment.ts`);
    console.log(`   Change DEV_MACHINE_IP to: '${ip}'\n`);
    
    console.log('🌐 Test your API connection:');
    console.log(`   curl http://${ip}:8081/auth/register/health\n`);
    
    console.log('💡 Make sure:');
    console.log('   • Your mobile device is on the same WiFi network');
    console.log('   • Your backend services are running');
    console.log('   • No firewall is blocking port 8081');
  } else {
    console.log('❌ Could not find a valid IP address');
    console.log('   Make sure you\'re connected to a network');
  }
}

main();
