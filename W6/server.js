/**
 * AI Fluency — Week 6 (FL-07) End-to-End Contact API Server
 * Student: Vinay Dhiman
 * Features: Form Validation, Rate Limiting, Webhook Delivery Simulation, CORS Headers
 */

import http from 'http';
import url from 'url';

const PORT = 3001;
const submissionLogs = [];
const rateLimitMap = new Map();

// Helper: CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  // GET /api/contact/health
  if (req.method === 'GET' && parsedUrl.pathname === '/api/contact/health') {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ status: 'HEALTHY', server: 'Node.js ESM API Backend', totalSubmissions: submissionLogs.length }));
    return;
  }

  // GET /api/contact/logs
  if (req.method === 'GET' && parsedUrl.pathname === '/api/contact/logs') {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ success: true, count: submissionLogs.length, logs: submissionLogs }));
    return;
  }

  // POST /api/contact — End-to-End Contact Form Submission Endpoint
  if (req.method === 'POST' && parsedUrl.pathname === '/api/contact') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { name, email, projectType, message } = payload;

        // Step 1: Input Validation
        if (!name || !email || !message) {
          res.writeHead(400, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            error: 'VALIDATION_FAILED',
            message: 'Name, email, and message fields are required.'
          }));
          return;
        }

        // Email Format Regex Check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          res.writeHead(422, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            error: 'INVALID_EMAIL_FORMAT',
            message: 'Please provide a valid email address.'
          }));
          return;
        }

        // Step 2: Rate Limiting Check (Max 5 submissions per minute per IP/Client)
        const clientIp = req.socket.remoteAddress || '127.0.0.1';
        const now = Date.now();
        const clientLimits = rateLimitMap.get(clientIp) || [];
        const recentSubmissions = clientLimits.filter(time => now - time < 60000);

        if (recentSubmissions.length >= 5) {
          res.writeHead(429, corsHeaders);
          res.end(JSON.stringify({
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many submissions. Please wait 60 seconds before trying again.'
          }));
          return;
        }

        recentSubmissions.push(now);
        rateLimitMap.set(clientIp, recentSubmissions);

        // Step 3: Process & Store Payload
        const submissionRef = `REF-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
        const timestamp = new Date().toISOString();

        const submissionRecord = {
          ref: submissionRef,
          timestamp,
          clientIp,
          data: { name, email, projectType: projectType || 'General Engineering Inquiry', message },
          webhookStatus: 'DELIVERED_TO_SLACK_WEBHOOK (HTTP 200)'
        };

        submissionLogs.push(submissionRecord);

        // Print Server Output Log
        console.log(`[CONTACT API SUCCESS] Ref: ${submissionRef} | From: ${name} <${email}>`);

        // Step 4: Return HTTP 200 Success Response
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
          success: true,
          status: 'SUBMISSION_RECEIVED',
          reference: submissionRef,
          timestamp,
          receivedData: { name, email, projectType: projectType || 'General Engineering Inquiry' },
          delivery: {
            webhook: 'SLACK_WEBHOOK_HTTP_200',
            status: 'Delivered to Vinay Dhiman Inbox & Alert Channel'
          }
        }));

      } catch (err) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'SERVER_PARSE_ERROR',
          message: 'Malformed JSON payload received.'
        }));
      }
    });
    return;
  }

  // 404 Route Not Found
  res.writeHead(404, corsHeaders);
  res.end(JSON.stringify({ error: 'ROUTE_NOT_FOUND', message: 'API Endpoint not found.' }));
});

server.listen(PORT, () => {
  console.log(`[W6 CONTACT BACKEND SERVER RUNNING] http://localhost:${PORT}`);
  console.log(`Endpoint Ready: POST http://localhost:${PORT}/api/contact`);
});
