#!/usr/bin/env node

/**
 * Test script for Ensembl MCP Server
 * Tests all endpoints with various parameter combinations
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVER_PATH = join(__dirname, 'servers', 'ensembl', 'build', 'index.js');

// Test cases organized by endpoint
const tests = [
  // Lookup endpoints
  {
    name: 'lookup_gene_by_symbol - basic',
    tool: 'lookup_gene_by_symbol',
    args: { symbol: 'BRCA2' }
  },
  {
    name: 'lookup_gene_by_symbol - with species and expand',
    tool: 'lookup_gene_by_symbol',
    args: { symbol: 'TP53', species: 'human', expand: true }
  },
  {
    name: 'lookup_gene_by_id - basic',
    tool: 'lookup_gene_by_id',
    args: { id: 'ENSG00000139618' }
  },

  // Sequence endpoint
  {
    name: 'get_sequence - genomic',
    tool: 'get_sequence',
    args: { id: 'ENSG00000139618', type: 'genomic' }
  },
  {
    name: 'get_sequence - protein',
    tool: 'get_sequence',
    args: { id: 'ENSP00000369497', type: 'protein' }
  },

  // Variant endpoints
  {
    name: 'get_variants_for_region',
    tool: 'get_variants_for_region',
    args: { region: '9:22125500-22125510', species: 'human' }
  },
  {
    name: 'vep_region - basic',
    tool: 'vep_region',
    args: { region: '9:22125503-22125502:1', allele: 'C' }
  },
  {
    name: 'vep_region - with transcript selection',
    tool: 'vep_region',
    args: {
      region: '9:22125503-22125502:1',
      allele: 'C',
      canonical: true,
      pick: true
    }
  },
  {
    name: 'vep_region - with annotations',
    tool: 'vep_region',
    args: {
      region: '9:22125503-22125502:1',
      allele: 'C',
      hgvs: true,
      protein: true,
      domains: true
    }
  },
  {
    name: 'vep_region - with prediction plugins',
    tool: 'vep_region',
    args: {
      region: '9:22125503-22125502:1',
      allele: 'C',
      CADD: true,
      Conservation: true
    }
  },

  // Homology
  {
    name: 'get_homology - orthologues',
    tool: 'get_homology',
    args: { id: 'ENSG00000139618', type: 'orthologues' }
  },

  // Cross-references
  {
    name: 'get_xrefs_by_gene',
    tool: 'get_xrefs_by_gene',
    args: { gene_id: 'ENSG00000139618' }
  },
  {
    name: 'get_xrefs_by_symbol',
    tool: 'get_xrefs_by_symbol',
    args: { symbol: 'BRCA2', species: 'human' }
  },

  // Overlap
  {
    name: 'overlap_region - genes',
    tool: 'overlap_region',
    args: { region: '7:140424943-140624564', feature: 'gene' }
  },
  {
    name: 'overlap_region - variations',
    tool: 'overlap_region',
    args: { region: '7:140424943-140424950', feature: 'variation' }
  },

  // Mapping
  {
    name: 'map_assembly',
    tool: 'map_assembly',
    args: {
      species: 'human',
      asm_one: 'GRCh37',
      region: 'X:1000000..1000100:1',
      asm_two: 'GRCh38'
    }
  },

  // Ontology
  {
    name: 'get_ontology_by_id',
    tool: 'get_ontology_by_id',
    args: { id: 'GO:0005667' }
  },
  {
    name: 'search_ontology_by_name',
    tool: 'search_ontology_by_name',
    args: { name: 'transcription factor' }
  },

  // Taxonomy
  {
    name: 'get_taxonomy_by_id',
    tool: 'get_taxonomy_by_id',
    args: { id: '9606' }
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
  console.log('🧬 Testing Ensembl MCP Server\n');
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
