#!/usr/bin/env node
/**
 * 项目雷达后端服务
 * 提供数据更新 API 接口
 */

const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.static(__dirname));

// CORS 支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 触发 GitHub Actions workflow API
app.post('/api/trigger-workflow', async (req, res) => {
  console.log(`[${new Date().toISOString()}] 收到 GitHub Actions 触发请求`);
  
  const { trigger_source = 'manual' } = req.body || {};
  
  // GitHub 配置
  const GITHUB_OWNER = process.env.GITHUB_OWNER || 'aluxfly';
  const GITHUB_REPO = process.env.GITHUB_REPO || 'ali';
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const WORKFLOW_ID = 'update-data.yml';
  
  if (!GITHUB_TOKEN) {
    return res.status(500).json({
      success: false,
      error: '未配置 GITHUB_TOKEN，请在环境变量中设置'
    });
  }
  
  try {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_ID}/dispatches`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          trigger_source: trigger_source
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GitHub API 错误：${error.message || response.statusText}`);
    }
    
    console.log(`[${new Date().toISOString()}] GitHub Actions 触发成功`);
    res.json({
      success: true,
      message: 'GitHub Actions 已触发',
      workflow: WORKFLOW_ID,
      trigger_source: trigger_source,
      actions_url: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions`
    });
    
  } catch (err) {
    console.error(`[${new Date().toISOString()}] 触发 GitHub Actions 失败:`, err);
    res.status(500).json({
      success: false,
      error: err.message || '触发失败'
    });
  }
});

// 更新数据 API
app.post('/api/update-data', async (req, res) => {
  console.log(`[${new Date().toISOString()}] 收到数据更新请求`);
  
  const crawlScript = path.join(__dirname, 'crawl_sgcc.py');
  const dataFile = path.join(__dirname, 'data', 'projects.json');
  
  // 检查爬虫脚本是否存在
  if (!fs.existsSync(crawlScript)) {
    return res.status(500).json({ 
      success: false, 
      error: '爬虫脚本不存在',
      path: crawlScript
    });
  }
  
  // 记录开始时间
  const startTime = Date.now();
  
  // 执行爬虫脚本
  const pythonProcess = spawn('python3.11', [crawlScript], {
    cwd: __dirname,
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
  });
  
  let output = '';
  let errorOutput = '';
  
  pythonProcess.stdout.on('data', (data) => {
    const text = data.toString();
    output += text;
    console.log(`[爬虫输出] ${text.trim()}`);
  });
  
  pythonProcess.stderr.on('data', (data) => {
    const text = data.toString();
    errorOutput += text;
    console.error(`[爬虫错误] ${text.trim()}`);
  });
  
  pythonProcess.on('close', (code) => {
    const duration = Date.now() - startTime;
    
    if (code === 0) {
      // 检查数据文件是否已更新
      let crawlDate = '未知';
      if (fs.existsSync(dataFile)) {
        try {
          const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
          crawlDate = data.crawl_date || '未知';
        } catch (e) {
          console.error('读取数据文件失败:', e);
        }
      }
      
      console.log(`[${new Date().toISOString()}] 数据更新完成，耗时 ${duration}ms`);
      res.json({
        success: true,
        message: '数据更新成功',
        crawlDate: crawlDate,
        duration: duration,
        output: output.slice(-500) // 只返回最后 500 字符
      });
    } else {
      console.error(`[${new Date().toISOString()}] 爬虫执行失败，退出码：${code}`);
      res.status(500).json({
        success: false,
        error: `爬虫执行失败，退出码：${code}`,
        details: errorOutput.slice(-1000)
      });
    }
  });
  
  pythonProcess.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] 爬虫进程错误:`, err);
    res.status(500).json({
      success: false,
      error: '无法启动爬虫进程',
      details: err.message
    });
  });
});

// 获取数据状态 API
app.get('/api/data-status', (req, res) => {
  const dataFile = path.join(__dirname, 'data', 'projects.json');
  
  if (!fs.existsSync(dataFile)) {
    return res.json({
      exists: false,
      message: '数据文件不存在'
    });
  }
  
  try {
    const stats = fs.statSync(dataFile);
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
    const projectCount = data.projects ? data.projects.length : 0;
    
    res.json({
      exists: true,
      lastModified: stats.mtime.toISOString(),
      crawlDate: data.crawl_date || '未知',
      projectCount: projectCount,
      fileSize: stats.size
    });
  } catch (e) {
    res.status(500).json({
      exists: true,
      error: '读取数据文件失败',
      details: e.message
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║           📡 项目雷达后端服务已启动                      ║
╠══════════════════════════════════════════════════════════╣
║  本地访问：http://localhost:${PORT}                       ║
║  数据更新 API: POST http://localhost:${PORT}/api/update-data ║
║  状态检查：GET  http://localhost:${PORT}/api/data-status   ║
║  健康检查：GET  http://localhost:${PORT}/health            ║
╚══════════════════════════════════════════════════════════╝
  `);
});
