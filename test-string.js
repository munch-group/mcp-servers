#!/usr/bin/env node

/**
 * Test script for STRING MCP Server
 * Tests all endpoints with various parameter combinations
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVER_PATH = join(__dirname, 'servers', 'string', 'build', 'index.js');

// Test cases organized by endpoint
const tests = [
  // Identifier mapping
  {
    name: 'get_string_ids - basic',
    tool: 'get_string_ids',
    args: { identifiers: 'TP53' }
  },
  {
    name: 'get_string_ids - multiple proteins',
    tool: 'get_string_ids',
    args: { identifiers: 'TP53 BRCA1 EGFR', species: 9606, limit: 1 }
  },
  {
    name: 'get_string_ids - with echo_query',
    tool: 'get_string_ids',
    args: { identifiers: 'TP53', species: 9606, echo_query: true }
  },

  // Network and interactions
  {
    name: 'get_network - basic',
    tool: 'get_network',
    args: { identifiers: 'TP53 MDM2' }
  },
  {
    name: 'get_network - high confidence',
    tool: 'get_network',
    args: {
      identifiers: 'TP53 MDM2',
      species: 9606,
      required_score: 700
    }
  },
  {
    name: 'get_network - physical only',
    tool: 'get_network',
    args: {
      identifiers: 'TP53 MDM2',
      network_type: 'physical',
      required_score: 400
    }
  },
  {
    name: 'get_network - with additional nodes',
    tool: 'get_network',
    args: {
      identifiers: 'TP53',
      add_nodes: 5,
      required_score: 700
    }
  },
  {
    name: 'get_interaction_partners - basic',
    tool: 'get_interaction_partners',
    args: { identifiers: 'TP53' }
  },
  {
    name: 'get_interaction_partners - limit 20',
    tool: 'get_interaction_partners',
    args: {
      identifiers: 'TP53',
      limit: 20,
      required_score: 700
    }
  },

  // Enrichment analysis
  {
    name: 'get_enrichment - basic',
    tool: 'get_enrichment',
    args: { identifiers: 'TP53\nMDM2\nCDKN1A\nBAX\nBCL2' }
  },
  {
    name: 'get_enrichment - mouse',
    tool: 'get_enrichment',
    args: {
      identifiers: 'Trp53\nMdm2\nCdkn1a',
      species: 10090
    }
  },
  {
    name: 'get_ppi_enrichment - basic',
    tool: 'get_ppi_enrichment',
    args: { identifiers: 'TP53\nMDM2\nCDKN1A\nBAX\nBCL2' }
  },
  {
    name: 'get_ppi_enrichment - high confidence',
    tool: 'get_ppi_enrichment',
    args: {
      identifiers: 'TP53\nMDM2\nCDKN1A\nBAX\nBCL2',
      required_score: 700
    }
  },

  // Homology
  {
    name: 'get_homology - basic',
    tool: 'get_homology',
    args: { identifiers: 'TP53' }
  },
  {
    name: 'get_homology - human to mouse',
    tool: 'get_homology',
    args: {
      identifiers: 'TP53',
      species: 9606,
      target_species: 10090
    }
  },
  {
    name: 'get_homology_best - human to mouse',
    tool: 'get_homology_best',
    args: {
      identifiers: 'TP53 BRCA1',
      species: 9606,
      target_species: 10090
    }
  },

  // Utilities
  {
    name: 'resolve_proteins - basic',
    tool: 'resolve_proteins',
    args: { identifiers: 'p53 tumor protein' }
  },
  {
    name: 'resolve_proteins - multiple',
    tool: 'resolve_proteins',
    args: {
      identifiers: 'p53 brca1 egfr',
      species: 9606
    }
  },
  {
    name: 'get_version',
    tool: 'get_version',
    args: {}
  }
];

async function callTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const server = spawn('node', [SERVER_PATH], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let response = '';

    server.stdout.on('data', (data) => {
      stdout += data.toString();

      // Try to parse JSON-RPC messages
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.trim().startsWith('{')) {
          try {
            const msg = JSON.parse(line.trim());
            if (msg.result) {
              response = msg.result;
            }
          } catch (e) {
            // Not valid JSON yet
          }
        }
      }
    });

    server.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Initialize
    const initMsg = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    };
    server.stdin.write(JSON.stringify(initMsg) + '\n');

    setTimeout(() => {
      // Call tool
      const toolMsg = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      };
      server.stdin.write(JSON.stringify(toolMsg) + '\n');
    }, 500);

    setTimeout(() => {
      server.kill();
      if (response) {
        resolve(response);
      } else {
        reject(new Error(`No response. stderr: ${stderr}`));
      }
    }, 5000);
  });
}

async function runTests() {
  console.log('🧬 Testing STRING MCP Server\n');
  console.log(`Total tests: ${tests.length}\n`);

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    process.stdout.write(`Testing: ${test.name}... `);

    try {
      const result = await callTool(test.tool, test.args);

      if (result && result.content && result.content.length > 0) {
        const content = result.content[0].text;
        const parsed = JSON.parse(content);

        if (result.isError) {
          console.log('❌ FAILED (API Error)');
          console.log(`   Error: ${content.substring(0, 100)}...`);
          failed++;
        } else if (parsed && (Array.isArray(parsed) || typeof parsed === 'object')) {
          console.log('✅ PASSED');
          passed++;
        } else {
          console.log('⚠️  WARNING: Unexpected response format');
          passed++;
        }
      } else {
        console.log('❌ FAILED (No content)');
        failed++;
      }
    } catch (error) {
      console.log('❌ FAILED');
      console.log(`   Error: ${error.message}`);
      failed++;
    }

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`Success rate: ${((passed / tests.length) * 100).toFixed(1)}%`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
