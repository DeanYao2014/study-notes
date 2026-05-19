/**
 * 自动生成 Docsify _sidebar.md
 * 用法：node generate-sidebar.js
 *
 * 支持 .md 文件顶部元数据（HTML 注释，单行或多行均可）：
 *   <!-- order: 1, show: false, title: 自定义标题 -->
 *
 *   或
 *
 *   <!--
 *   order: 2
 *   show: false
 *   title: 自定义显示名
 *   -->
 *
 * 属性说明：
 *   order   - 数字，越小越靠前（默认 999）
 *   show    - false 则不在导航中显示（默认 true）
 *   isShow  - show 的别名
 *   title   - 覆盖导航中显示的文本（默认用文件名去 .md）
 *
 * 目录排序：修改下方 DIR_ORDER 配置
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUTPUT = path.join(ROOT, '_sidebar.md');
const IGNORE_FILE = path.join(ROOT, '.docsignore');

// ---------- 目录排序（数字越小越靠前，未列出的默认 999）----------
const DIR_ORDER = {
  '数学': 10,
  '物理': 20,
  '化学': 30,
  '生物': 40,
  '地理': 50,
  '历史': 60,
  '语文': 70,
  '英语': 80,
  '新概念英语': 90,
};

// ---------- 目录图标映射 ----------
const DIR_ICONS = {
  '数学': '📐', '英语': '📝', '物理': '🔬', '化学': '🧪',
  '生物': '🧬', '地理': '🌍', '历史': '📜', '语文': '📖',
  '新概念英语': '📗',
};

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
    const regex = new RegExp('^' + p.replace(/\*/g, '.*') + '$', 'i');
    return regex.test(name);
  });
}

// ---------- 解析 .md 文件顶部元数据 ----------
function parseMetadata(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    let block = '';

    // 多行注释：<!-- \n ... \n -->
    const multi = content.match(/^<!--\s*\n([\s\S]*?)\s*-->/);
    if (multi) {
      block = multi[1];
    } else {
      // 单行注释：<!-- key: val, key2: val2 -->
      const single = content.match(/^<!--\s*(.+?)\s*-->/);
      if (single) block = single[1];
    }

    if (!block) return {};

    const meta = {};
    // 支持逗号分隔的单行：order: 1, show: false
    const parts = block.includes(',') && !block.includes('\n')
      ? block.split(',').map(s => s.trim())
      : block.split('\n');

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      // "key: value" 或 "key:value"
      const kv = trimmed.match(/^\s*(\w+)\s*:\s*(.+?)\s*$/);
      if (!kv) continue;
      const key = kv[1];
      const rawVal = kv[2].trim();

      let val;
      if (rawVal === 'true') val = true;
      else if (rawVal === 'false') val = false;
      else if (/^-?\d+$/.test(rawVal)) val = parseInt(rawVal, 10);
      else val = rawVal;

      meta[key] = val;
    }
    return meta;
  } catch (e) {
    return {};
  }
}

// ---------- 递归扫描 ----------
function scanDir(dirPath, patterns) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const dirs = [];
  const files = [];

  for (const entry of entries) {
    const name = entry.name;
    if (isIgnored(name, patterns)) continue;
    if (name.startsWith('.')) continue;

    if (entry.isDirectory()) {
      const sub = scanDir(path.join(dirPath, name), patterns);
      if (sub.dirs.length > 0 || sub.files.length > 0) {
        const order = DIR_ORDER[name] !== undefined ? DIR_ORDER[name] : 999;
        dirs.push({ name, sub, order });
      }
    } else if (entry.isFile() && name.endsWith('.md')) {
      const filePath = path.join(dirPath, name);
      const meta = parseMetadata(filePath);
      if (meta.show === false || meta.isShow === false) continue;
      files.push({ name, meta });
    }
  }

  // 按 order 排序，同 order 按拼音
  dirs.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.name.localeCompare(b.name, 'zh-CN');
  });
  files.sort((a, b) => {
    const oA = a.meta.order !== undefined ? a.meta.order : 999;
    const oB = b.meta.order !== undefined ? b.meta.order : 999;
    if (oA !== oB) return oA - oB;
    return a.name.localeCompare(b.name, 'zh-CN');
  });

  return { dirs, files };
}

// ---------- URL 安全编码 ----------
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
    const displayName = file.meta.title || file.name.replace(/\.md$/, '');
    const fullPath = path.join(basePath, file.name).replace(/\\/g, '/');
    lines.push(`${'  '.repeat(level)}  - [${displayName}](${safeUrl(fullPath)})`);
  }

  return lines;
}

// ---------- 主流程 ----------
function main() {
  const patterns = loadIgnorePatterns();
  console.log('📋 黑名单规则:', patterns.length ? patterns.join(', ') : '(无)');

  const tree = scanDir(ROOT, patterns);

  let content = '<!-- 此文件由 generate-sidebar.js 自动生成 -->\n\n';
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
