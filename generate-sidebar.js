/**
 * 自动生成 Docsify _sidebar.md
 * 用法：node generate-sidebar.js
 * 读取 .docsignore 黑名单 → 递归遍历目录 → 生成侧边栏
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUTPUT = path.join(ROOT, '_sidebar.md');
const IGNORE_FILE = path.join(ROOT, '.docsignore');

// ---------- 读取黑名单 ----------
function loadIgnorePatterns() {
  if (!fs.existsSync(IGNORE_FILE)) return [];
  return fs.readFileSync(IGNORE_FILE, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

// ---------- 匹配黑名单 ----------
function isIgnored(name, patterns) {
  return patterns.some(p => {
    // 简单 glob 匹配：* 通配
    const regex = new RegExp('^' + p.replace(/\*/g, '.*') + '$', 'i');
    return regex.test(name);
  });
}

// ---------- 递归扫描 ----------
function scanDir(dirPath, patterns, level) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const result = { dirs: [], files: [] };

  for (const entry of entries) {
    const name = entry.name;
    if (isIgnored(name, patterns)) continue;
    if (name.startsWith('.')) continue;  // 隐藏文件/目录

    if (entry.isDirectory()) {
      const sub = scanDir(path.join(dirPath, name), patterns, level + 1);
      if (sub.dirs.length > 0 || sub.files.length > 0) {
        result.dirs.push({ name, sub });
      }
    } else if (entry.isFile() && name.endsWith('.md')) {
      result.files.push(name);
    }
  }
  return result;
}

// ---------- 目录图标映射 ----------
const DIR_ICONS = {
  '数学': '📐', '英语': '📝', '物理': '🔬', '化学': '🧪',
  '生物': '🧬', '地理': '🌍', '历史': '📜', '语文': '📖',
  '新概念英语': '📗',
};

// ---------- URL 安全编码（只编码空格和特殊字符）----------
function safeUrl(p) {
  return p.replace(/\\/g, '/').split('/').map(function (seg) {
    return seg.replace(/ /g, '%20').replace(/#/g, '%23');
  }).join('/');
}

// ---------- 生成侧边栏 Markdown ----------
function renderSidebar(tree, basePath) {
  let lines = [];
  const level = basePath.split('/').length;

  for (const dir of tree.dirs) {
    const icon = DIR_ICONS[dir.name] || '📁';
    lines.push(`${'  '.repeat(level)}- ${icon} ${dir.name}`);
    lines.push(...renderSidebar(dir.sub, path.join(basePath, dir.name)));
  }

  for (const file of tree.files) {
    const displayName = file.replace(/\.md$/, '');
    const fullPath = path.join(basePath, file).replace(/\\/g, '/');
    lines.push(`${'  '.repeat(level)}  - [${displayName}](${safeUrl(fullPath)})`);
  }

  return lines;
}

// ---------- 主流程 ----------
function main() {
  const patterns = loadIgnorePatterns();
  console.log('📋 黑名单规则:', patterns.length ? patterns.join(', ') : '(无)');

  const tree = scanDir(ROOT, patterns, 0);

  let content = '<!-- 此文件由 generate-sidebar.js 自动生成，请勿手动编辑 -->\n\n';
  content += '- [**🏠 首页**](/)\n';

  for (const dir of tree.dirs) {
    const icon = DIR_ICONS[dir.name] || '📁';
    content += `- ${icon} ${dir.name}\n`;
    content += renderSidebar(dir.sub, dir.name).join('\n') + '\n';
  }

  content = content.replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(OUTPUT, content, 'utf-8');
  console.log('✅ 已生成 _sidebar.md');
  console.log(content);
}

main();
