// Bulk lint fixer script
// Reads ESLint JSON output and applies fixes

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// const _path = require('path');

const data = JSON.parse(fs.readFileSync('lint_output.json', 'utf8'));
// const root = path.resolve(__dirname);

let totalFixed = 0;

for (const fileResult of data) {
  if (fileResult.errorCount === 0 && fileResult.warningCount === 0) continue;

  const relPath = fileResult.filePath.replace(/.*onwynd-frontend[\\/]/, '');
  const filePath = fileResult.filePath;

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    console.error(`Cannot read: ${relPath}`);
    continue;
  }

  let lines = content.split('\n');
  let modified = false;

  // Group messages by rule
  const messagesByRule = {};
  for (const msg of fileResult.messages) {
    const rule = msg.ruleId || 'unknown';
    if (!messagesByRule[rule]) messagesByRule[rule] = [];
    messagesByRule[rule].push(msg);
  }

  // Fix @typescript-eslint/no-explicit-any - replace : any with : unknown
  if (messagesByRule['@typescript-eslint/no-explicit-any']) {
    for (const msg of messagesByRule['@typescript-eslint/no-explicit-any']) {
      const lineIdx = msg.line - 1;
      if (lineIdx >= 0 && lineIdx < lines.length) {
        const line = lines[lineIdx];
        // Replace various patterns of `any`
        let newLine = line;

        // Pattern: `: any)` -> `: unknown)`
        // Pattern: `: any[]` -> `: unknown[]`
        // Pattern: `: any |` -> `: unknown |`
        // Pattern: `: any,` -> `: unknown,`
        // Pattern: `: any;` -> `: unknown;`
        // Pattern: `<any>` -> `<unknown>`
        // Pattern: `<any[]>` -> `<unknown[]>`
        // Pattern: `: any {` -> `: unknown {`
        // Pattern: `(any)` at col position

        // Use column info to be precise
        const col = msg.column - 1; // 0-indexed

        // Find 'any' at approximately this column
        // const beforeCol = line.substring(0, Math.max(0, col - 5));
        const atCol = line.substring(col);

        if (atCol.startsWith('any')) {
          // Check what comes after 'any'
          const after = atCol.substring(3);
          const before = col > 0 ? line[col - 1] : '';

          // Only replace if it's the type annotation 'any', not part of a word
          if (before === ' ' || before === ':' || before === '<' || before === '(' || before === ',') {
            if (after.length === 0 || /^[\s\[\]>),;|&{}]/.test(after[0])) {
              newLine = line.substring(0, col) + 'unknown' + line.substring(col + 3);
            }
          }
        }

        if (newLine !== line) {
          lines[lineIdx] = newLine;
          modified = true;
          totalFixed++;
        }
      }
    }
  }

  // Fix @typescript-eslint/no-unused-vars
  if (messagesByRule['@typescript-eslint/no-unused-vars']) {
    // Sort by line number descending so we can safely modify/remove lines
    const msgs = [...messagesByRule['@typescript-eslint/no-unused-vars']].sort((a, b) => b.line - a.line);

    for (const msg of msgs) {
      const lineIdx = msg.line - 1;
      if (lineIdx < 0 || lineIdx >= lines.length) continue;

      const line = lines[lineIdx];
      const varName = msg.message.match(/'([^']+)'/)?.[1];
      if (!varName) continue;

      // Check if this is an import line
      const isImportLine = line.trim().startsWith('import ');
      const isFromImport = line.includes(' from ');

      if (isImportLine || isFromImport) {
        // Check if we're inside a multi-line import that spans this line
        // Look for import pattern within nearby lines
        let importStart = lineIdx;
        let importEnd = lineIdx;

        // Find the start of the import statement
        while (importStart > 0 && !lines[importStart].trim().startsWith('import ')) {
          importStart--;
        }
        // Find the end of the import statement (line with 'from')
        while (importEnd < lines.length - 1 && !lines[importEnd].includes(' from ')) {
          importEnd++;
        }

        const importBlock = lines.slice(importStart, importEnd + 1).join('\n');

        // Try to remove just this import name from the import statement
        const escapedName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Pattern: { ..., VarName, ... } or { VarName, ... } or { ..., VarName }
        let newBlock = importBlock;

        // Remove "VarName, " or ", VarName" from import
        newBlock = newBlock.replace(new RegExp(`\\b${escapedName}\\b,\\s*`, 'g'), '');
        newBlock = newBlock.replace(new RegExp(`,\\s*\\b${escapedName}\\b`, 'g'), '');

        // Check if import is now empty: import {  } from '...'
        // or import { \n } from '...'
        const emptyImport = newBlock.match(/import\s*\{\s*\}\s*from/s);

        if (newBlock !== importBlock) {
          if (emptyImport) {
            // Remove the entire import statement
            for (let i = importStart; i <= importEnd; i++) {
              lines[i] = null; // Mark for deletion
            }
          } else {
            const newLines = newBlock.split('\n');
            for (let i = importStart; i <= importEnd; i++) {
              lines[i] = i - importStart < newLines.length ? newLines[i - importStart] : null;
            }
          }
          modified = true;
          totalFixed++;
        }
      } else {
        // Not an import - it's a variable, param, or destructured binding
        // Prefix with underscore
        const col = msg.column - 1;

        // Check if it's a catch clause variable
        if (line.match(/\}\s*catch\s*\(/)) {
          // Replace catch (error) with catch (_error) etc.
          const newLine = line.replace(new RegExp(`catch\\s*\\(\\s*${varName}\\s*\\)`), `catch (_${varName})`);
          if (newLine !== line) {
            lines[lineIdx] = newLine;
            modified = true;
            totalFixed++;
          }
        }
        // Check if it's a destructured variable like const { error } = ...
        else if (line.includes('{') && line.includes(varName)) {
          // Prefix the variable name with underscore in destructuring
          const escapedName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // Handle: const { varName, ... } or { ..., varName }
          // But also handle aliasing: { varName: _varName }
          const patterns = [
            // varName in destructuring without alias
            new RegExp(`(\\{[^}]*?)\\b${escapedName}\\b(?!\\s*:)([^}]*?\\})`, 's'),
          ];

          let newLine = line;
          for (const pattern of patterns) {
            newLine = newLine.replace(pattern, (match, before, after) => {
              return before + `${varName}: _${varName}` + after;
            });
          }

          if (newLine !== line) {
            lines[lineIdx] = newLine;
            modified = true;
            totalFixed++;
          } else {
            // Fallback: just prefix the variable
            const newLine2 = line.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
            if (newLine2 !== line) {
              lines[lineIdx] = newLine2;
              modified = true;
              totalFixed++;
            }
          }
        }
        // Check for function params like (set, get)
        else if (line.includes(varName)) {
          // const escapedName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // Only prefix if it's clearly a standalone variable name at the right column
          const atCol = line.substring(col);
          if (atCol.startsWith(varName)) {
            const charBefore = col > 0 ? line[col - 1] : ' ';
            const charAfter = line[col + varName.length] || ' ';
            if (/[\s,(\[]/.test(charBefore) && /[\s,)\]:;=]/.test(charAfter)) {
              lines[lineIdx] = line.substring(0, col) + '_' + line.substring(col);
              modified = true;
              totalFixed++;
            }
          }
        }
      }
    }
  }

  // Fix react/no-unescaped-entities
  if (messagesByRule['react/no-unescaped-entities']) {
    for (const msg of messagesByRule['react/no-unescaped-entities']) {
      const lineIdx = msg.line - 1;
      if (lineIdx < 0 || lineIdx >= lines.length) continue;

      const col = msg.column - 1;
      const line = lines[lineIdx];
      const char = line[col];

      if (char === "'") {
        lines[lineIdx] = line.substring(0, col) + '&apos;' + line.substring(col + 1);
        modified = true;
        totalFixed++;
      } else if (char === '"') {
        lines[lineIdx] = line.substring(0, col) + '&quot;' + line.substring(col + 1);
        modified = true;
        totalFixed++;
      }
    }
  }

  // Fix @typescript-eslint/ban-ts-comment - replace @ts-ignore with @ts-expect-error
  if (messagesByRule['@typescript-eslint/ban-ts-comment']) {
    for (const msg of messagesByRule['@typescript-eslint/ban-ts-comment']) {
      const lineIdx = msg.line - 1;
      if (lineIdx < 0 || lineIdx >= lines.length) continue;

      const line = lines[lineIdx];
      const newLine = line.replace(/@ts-ignore/g, '@ts-expect-error');
      if (newLine !== line) {
        lines[lineIdx] = newLine;
        modified = true;
        totalFixed++;
      }
    }
  }

  if (modified) {
    // Remove null lines (deleted imports)
    lines = lines.filter(l => l !== null);

    // Clean up any double blank lines from removed imports
    let result = lines.join('\n');
    result = result.replace(/\n\n\n+/g, '\n\n');

    fs.writeFileSync(filePath, result, 'utf8');
    console.log(`Fixed: ${relPath}`);
  }
}

console.log(`\nTotal fixes applied: ${totalFixed}`);
