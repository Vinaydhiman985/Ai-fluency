/**
 * MCP Client / Runner Script — Demonstrating 3 MCP Tool Calls (ESM)
 * Student: Vinay Dhiman | Course: AI Fluency (Week 4 / FL-04)
 */

import { processRPCRequest } from './mcp_server.js';

async function runMCPTasks() {
  console.log('====================================================');
  console.log('  MODEL CONTEXT PROTOCOL (MCP) — CLIENT DEMONSTRATION');
  console.log('====================================================\n');

  // Step 1: Initialize MCP Protocol
  console.log('>>> [1] INITIALIZING MCP SESSION...');
  const initReq = { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} };
  const initRes = await processRPCRequest(initReq);
  console.log('Server Protocol Response:', JSON.stringify(initRes.result, null, 2));

  // Step 2: Discover Available Tools
  console.log('\n>>> [2] DISCOVERING MCP TOOLS (tools/list)...');
  const listReq = { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} };
  const listRes = await processRPCRequest(listReq);
  console.log('Discovered Tools:', listRes.result.tools.map(t => `\n - ${t.name}: ${t.description}`).join(''));

  console.log('\n====================================================');
  console.log('  EXECUTING 3 TASKS THAT CHAT ALONE COULD NOT DO');
  console.log('====================================================');

  // TASK 1: Local File Inspection
  console.log('\n--- TASK 1: Read & Inspect Local Workspace File ---');
  const task1Req = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'read_workspace_file',
      arguments: { relative_path: 'W3/FL-03_Identity_Kit.md', max_lines: 10 }
    }
  };
  console.log('Client Request -> tools/call:', JSON.stringify(task1Req.params));
  const task1Res = await processRPCRequest(task1Req);
  console.log('Server Output Content:\n', task1Res.result.content[0].text);

  // TASK 2: Real-Time System Diagnostics
  console.log('\n--- TASK 2: Retrieve Live OS Performance & System Metrics ---');
  const task2Req = {
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'get_system_diagnostics',
      arguments: { include_network: true }
    }
  };
  console.log('Client Request -> tools/call:', JSON.stringify(task2Req.params));
  const task2Res = await processRPCRequest(task2Req);
  console.log('Server Output Content:\n', task2Res.result.content[0].text);

  // TASK 3: Query Live External REST API
  console.log('\n--- TASK 3: Query Real-Time External Web Service (GitHub API) ---');
  const task3Req = {
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'fetch_live_api',
      arguments: { url: 'https://api.github.com/zen' }
    }
  };
  console.log('Client Request -> tools/call:', JSON.stringify(task3Req.params));
  const task3Res = await processRPCRequest(task3Req);
  console.log('Server Output Content:\n', task3Res.result.content[0].text);

  console.log('\n====================================================');
  console.log('  MCP DEMONSTRATION SUCCESSFULLY COMPLETED');
  console.log('====================================================');
}

runMCPTasks().catch(console.error);
