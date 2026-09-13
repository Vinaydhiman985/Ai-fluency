/**
 * Model Context Protocol (MCP) Server — Standalone Implementation (ESM)
 * Student: Vinay Dhiman | Course: AI Fluency (Week 4 / FL-04)
 * Protocol: JSON-RPC 2.0 over stdio / RPC interface
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define MCP Server Tool Schemas
export const TOOLS = [
  {
    name: 'read_workspace_file',
    description: 'Reads and inspects local filesystem files within the workspace.',
    inputSchema: {
      type: 'object',
      properties: {
        relative_path: { type: 'string', description: 'Relative path of file to read' },
        max_lines: { type: 'number', description: 'Maximum lines to return', default: 20 }
      },
      required: ['relative_path']
    }
  },
  {
    name: 'get_system_diagnostics',
    description: 'Fetches live operating system performance, memory, CPU, and process metrics.',
    inputSchema: {
      type: 'object',
      properties: {
        include_network: { type: 'boolean', description: 'Whether to include network interfaces', default: true }
      }
    }
  },
  {
    name: 'fetch_live_api',
    description: 'Queries a live external HTTP REST API endpoint for real-time data.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'HTTP/HTTPS URL to query' }
      },
      required: ['url']
    }
  }
];

// Tool Execution Handlers
export async function handleToolCall(name, args) {
  switch (name) {
    case 'read_workspace_file': {
      const targetPath = path.resolve(__dirname, '..', args.relative_path || '');
      if (!fs.existsSync(targetPath)) {
        return { isError: true, content: [{ type: 'text', text: `File not found: ${args.relative_path}` }] };
      }
      const fileContent = fs.readFileSync(targetPath, 'utf8');
      const lines = fileContent.split('\n').slice(0, args.max_lines || 20).join('\n');
      return {
        content: [
          {
            type: 'text',
            text: `[MCP FILE TOOL SUCCESS]\nFile: ${args.relative_path}\nTotal Bytes: ${fileContent.length}\nSnippet (First ${args.max_lines || 20} lines):\n---\n${lines}`
          }
        ]
      };
    }

    case 'get_system_diagnostics': {
      const freeMem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
      const totalMem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
      const cpus = os.cpus();
      const sysInfo = {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        uptime_seconds: Math.floor(os.uptime()),
        memory: { free_gb: `${freeMem} GB`, total_gb: `${totalMem} GB`, usage_percent: `${(((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(1)}%` },
        cpu_model: cpus[0]?.model || 'Unknown CPU',
        cpu_cores: cpus.length
      };

      if (args.include_network) {
        sysInfo.network_interfaces = Object.keys(os.networkInterfaces());
      }

      return {
        content: [
          {
            type: 'text',
            text: `[MCP SYSTEM DIAGNOSTICS SUCCESS]\n${JSON.stringify(sysInfo, null, 2)}`
          }
        ]
      };
    }

    case 'fetch_live_api': {
      return new Promise((resolve) => {
        const reqUrl = args.url || 'https://api.github.com/zen';
        const options = {
          headers: { 'User-Agent': 'MCP-Tool-Client/1.0' }
        };
        https.get(reqUrl, options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({
              content: [
                {
                  type: 'text',
                  text: `[MCP LIVE API TOOL SUCCESS]\nURL: ${reqUrl}\nStatus Code: ${res.statusCode}\nResponse Payload:\n${data}`
                }
              ]
            });
          });
        }).on('error', (err) => {
          resolve({
            isError: true,
            content: [{ type: 'text', text: `HTTP Request Failed: ${err.message}` }]
          });
        });
      });
    }

    default:
      return { isError: true, content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
  }
}

// JSON-RPC Request Processing
export async function processRPCRequest(request) {
  const { id, method, params } = request;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'ai-fluency-mcp-server', version: '1.0.0' }
      }
    };
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: { tools: TOOLS }
    };
  }

  if (method === 'tools/call') {
    const { name, arguments: toolArgs } = params;
    const toolResult = await handleToolCall(name, toolArgs);
    return {
      jsonrpc: '2.0',
      id,
      result: toolResult
    };
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${method}` }
  };
}
