#!/usr/bin/env node
/**
 * Cross-platform script to kill processes on specified ports
 * Works on Windows, macOS, and Linux
 */

const { execSync } = require('child_process');
const os = require('os');

const PORTS = [3000, 3001, 3002, 3003, 3004, 8000];

console.log('🔍 Cleaning up ports...');
console.log('─'.repeat(50));

/**
 * Kill process on port for Windows
 */
function killPortWindows(port) {
  try {
    // Find PID using netstat
    const netstatOutput = execSync(`netstat -aon | findstr :${port}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const lines = netstatOutput.split('\n');
    const pids = new Set();

    for (const line of lines) {
      // Look for LISTENING state
      if (line.includes('LISTENING') || line.includes('ESTABLISHED')) {
        // Extract PID from end of line
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && !isNaN(pid)) {
          pids.add(pid);
        }
      }
    }

    if (pids.size === 0) {
      console.log(`  Port ${port}: Not in use`);
      return true;
    }

    // Kill all found PIDs
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, {
          stdio: ['pipe', 'pipe', 'pipe']
        });
        console.log(`  Port ${port}: ✓ Killed process (PID: ${pid})`);
      } catch (err) {
        // Process might have already exited
        console.log(`  Port ${port}: Process ${pid} already stopped`);
      }
    }

    return true;
  } catch (error) {
    // No processes found on this port
    console.log(`  Port ${port}: Not in use`);
    return true;
  }
}

/**
 * Kill process on port for Unix (macOS/Linux)
 */
function killPortUnix(port) {
  try {
    // Try lsof first (most reliable)
    try {
      const output = execSync(`lsof -ti:${port}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const pids = output.trim().split('\n').filter(pid => pid);

      if (pids.length === 0) {
        console.log(`  Port ${port}: Not in use`);
        return true;
      }

      for (const pid of pids) {
        try {
          execSync(`kill -9 ${pid}`, { stdio: ['pipe', 'pipe', 'pipe'] });
          console.log(`  Port ${port}: ✓ Killed process (PID: ${pid})`);
        } catch (err) {
          console.log(`  Port ${port}: Process ${pid} already stopped`);
        }
      }

      return true;
    } catch (lsofError) {
      // lsof didn't find anything or isn't available
      // Try fuser as fallback (Linux)
      try {
        execSync(`fuser -k ${port}/tcp`, {
          stdio: ['pipe', 'pipe', 'pipe']
        });
        console.log(`  Port ${port}: ✓ Killed process`);
        return true;
      } catch (fuserError) {
        // No process found
        console.log(`  Port ${port}: Not in use`);
        return true;
      }
    }
  } catch (error) {
    console.log(`  Port ${port}: Not in use`);
    return true;
  }
}

/**
 * Kill process on specified port (cross-platform)
 */
function killPort(port) {
  const platform = os.platform();

  if (platform === 'win32') {
    return killPortWindows(port);
  } else {
    return killPortUnix(port);
  }
}

/**
 * Main execution
 */
function main() {
  let hasErrors = false;

  for (const port of PORTS) {
    try {
      killPort(port);
    } catch (error) {
      console.error(`  Port ${port}: ✗ Error - ${error.message}`);
      hasErrors = true;
    }
  }

  console.log('─'.repeat(50));

  if (hasErrors) {
    console.log('⚠️  Some ports could not be cleaned (this is usually OK)');
    process.exit(0); // Don't fail the script
  } else {
    console.log('✓ All ports cleaned successfully');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { killPort };
