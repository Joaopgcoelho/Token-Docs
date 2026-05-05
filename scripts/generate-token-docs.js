#!/usr/bin/env node

/**
 * Generate Token Documentation from token-schema.json.
 *
 * Reads the unified schema and produces artifacts for 3 surfaces:
 *   1. ES5 constants for code.js  (GROUP_META, GROUP_GUIDELINES)
 *   2. JSON for docs/index.html   (token-docs-data.json)
 *   3. Markdown for AI export      (token-docs-ai.md)
 *
 * Usage: node scripts/generate-token-docs.js
 */

const fs = require('fs');
const path = require('path');

// ── Schema reading ──────────────────────────────────────────────────────────

/**
 * Read and parse token-schema.json from the project root.
 * Aborts with exit code 1 and a descriptive error on parse failure.
 *
 * @returns {Object} Parsed schema object
 */
function readSchema() {
  const schemaPath = path.join(__dirname, '..', 'token-schema.json');

  let raw;
  try {
    raw = fs.readFileSync(schemaPath, 'utf8');
  } catch (err) {
    console.error('ERROR: Could not read token-schema.json —', err.message);
    process.exit(1);
  }

  let schema;
  try {
    schema = JSON.parse(raw);
  } catch (err) {
    console.error('ERROR: Invalid JSON in token-schema.json — ' + err.message);
    process.exit(1);
  }

  return schema;
}

// ── Schema validation ───────────────────────────────────────────────────────

const REQUIRED_GROUPS = ['dynamic', 'interactive', 'static', 'inputable', 'core', 'elevation'];
const REQUIRED_GROUP_FIELDS = ['label', 'color', 'description', 'whenUse', 'whenNotUse', 'roles'];

/**
 * Validate the parsed schema and return a report of errors and warnings.
 *
 * Checks performed:
 *  - All 6 required groups exist
 *  - Each group has the 6 required fields
 *  - Color r/g/b values are in [0, 1]
 *  - componentExamples reference roles that exist in the group
 *  - aiRules have valid id, severity, and rule length
 *  - decisionTree exists with question, yes, no fields
 *
 * @param {Object} schema - Parsed token-schema.json
 * @returns {{ errors: string[], warnings: string[] }}
 */
function validateSchema(schema) {
  const errors = [];
  const warnings = [];

  // ── Check groups object exists ──
  if (!schema.groups || typeof schema.groups !== 'object') {
    errors.push('Schema is missing the "groups" object');
    return { errors, warnings };
  }

  // ── Check all 6 required groups exist ──
  for (const groupKey of REQUIRED_GROUPS) {
    if (!schema.groups[groupKey]) {
      errors.push('Missing required group: "' + groupKey + '"');
    }
  }

  // ── Validate each group ──
  for (const groupKey of Object.keys(schema.groups)) {
    const group = schema.groups[groupKey];

    // Check required fields
    for (const field of REQUIRED_GROUP_FIELDS) {
      if (group[field] === undefined || group[field] === null) {
        errors.push('Group "' + groupKey + '" is missing required field: "' + field + '"');
      }
    }

    // Validate color r/g/b in [0, 1]
    if (group.color && typeof group.color === 'object') {
      for (const channel of ['r', 'g', 'b']) {
        const val = group.color[channel];
        if (typeof val !== 'number' || val < 0 || val > 1) {
          errors.push(
            'Group "' + groupKey + '" has invalid color.' + channel +
            ' value: ' + val + ' (must be between 0 and 1)'
          );
        }
      }
    }

    // Validate componentExamples reference existing roles
    if (Array.isArray(group.componentExamples) && group.roles) {
      const roleKeys = Object.keys(group.roles);

      for (let i = 0; i < group.componentExamples.length; i++) {
        const example = group.componentExamples[i];
        if (example.tokens && typeof example.tokens === 'object') {
          for (const role of Object.keys(example.tokens)) {
            if (!roleKeys.includes(role)) {
              warnings.push(
                'Group "' + groupKey + '", componentExample "' +
                (example.component || 'index ' + i) +
                '" references role "' + role + '" which does not exist in the group roles'
              );
            }
          }
        }

        // Also check state tokens reference valid roles
        if (example.states && typeof example.states === 'object') {
          for (const state of Object.keys(example.states)) {
            const stateTokens = example.states[state];
            if (stateTokens && typeof stateTokens === 'object') {
              for (const role of Object.keys(stateTokens)) {
                if (!roleKeys.includes(role)) {
                  warnings.push(
                    'Group "' + groupKey + '", componentExample "' +
                    (example.component || 'index ' + i) +
                    '", state "' + state +
                    '" references role "' + role + '" which does not exist in the group roles'
                  );
                }
              }
            }
          }
        }
      }
    }
  }

  // ── Validate aiRules ──
  if (Array.isArray(schema.aiRules)) {
    const idPattern = /^R\d{2}$/;
    const validSeverities = ['error', 'warning'];

    for (let i = 0; i < schema.aiRules.length; i++) {
      const rule = schema.aiRules[i];

      if (!rule.id || !idPattern.test(rule.id)) {
        errors.push('aiRule at index ' + i + ' has invalid id: "' + (rule.id || '') + '" (must match /^R\\d{2}$/)');
      }
      if (!rule.severity || !validSeverities.includes(rule.severity)) {
        errors.push('aiRule "' + (rule.id || 'index ' + i) + '" has invalid severity: "' + (rule.severity || '') + '" (must be "error" or "warning")');
      }
      if (!rule.rule || rule.rule.length <= 10) {
        errors.push('aiRule "' + (rule.id || 'index ' + i) + '" has rule text too short (must be > 10 characters)');
      }
    }
  }

  // ── Validate decisionTree ──
  if (!schema.decisionTree) {
    errors.push('Schema is missing "decisionTree"');
  } else {
    validateDecisionTreeNode(schema.decisionTree, 'root', errors);
  }

  return { errors, warnings };
}

/**
 * Recursively validate a decision tree node.
 *
 * @param {Object} node - Decision tree node
 * @param {string} path - Current path for error messages
 * @param {string[]} errors - Errors array to push to
 */
function validateDecisionTreeNode(node, nodePath, errors) {
  if (!node || typeof node !== 'object') {
    errors.push('decisionTree node at "' + nodePath + '" is invalid');
    return;
  }

  // If it has a result, it's a leaf — valid
  if (node.result) {
    return;
  }

  // Otherwise it must have question + yes + no
  if (!node.question || typeof node.question !== 'string') {
    errors.push('decisionTree node at "' + nodePath + '" is missing "question"');
  }
  if (node.yes === undefined) {
    errors.push('decisionTree node at "' + nodePath + '" is missing "yes" branch');
  } else {
    validateDecisionTreeNode(node.yes, nodePath + '.yes', errors);
  }
  if (node.no === undefined) {
    errors.push('decisionTree node at "' + nodePath + '" is missing "no" branch');
  } else {
    validateDecisionTreeNode(node.no, nodePath + '.no', errors);
  }
}

// ── Name conversion functions ────────────────────────────────────────────────

/**
 * Convert a Figma token path to a JavaScript variable name.
 *
 * Removes slashes, capitalizes the first letter of each word (including
 * words separated by spaces within a segment), and prepends "LfThm".
 *
 * @param {string} figmaPath - Figma path, e.g. "Dynamic/Primary/Surface/Default"
 * @returns {string} JS name, e.g. "LfThmDynamicPrimarySurfaceDefault"
 *
 * @example
 * figmaPathToJsName("Dynamic/Primary/On Surface/Default")
 * // → "LfThmDynamicPrimaryOnSurfaceDefault"
 */
function figmaPathToJsName(figmaPath) {
  const segments = figmaPath.split('/');
  let jsName = 'LfThm';

  for (const segment of segments) {
    const words = segment.split(' ');
    for (const word of words) {
      if (word.length === 0) continue;
      jsName += word.charAt(0).toUpperCase() + word.slice(1);
    }
  }

  return jsName;
}

/**
 * Convert a JavaScript variable name to a CSS custom property.
 *
 * Splits camelCase into segments (uppercase letters and digit boundaries
 * start new segments), joins with hyphens, lowercases, and prepends "--".
 *
 * @param {string} jsName - JS name, e.g. "LfThmDynamicPrimarySurfaceDefault"
 * @returns {string} CSS var, e.g. "--lf-thm-dynamic-primary-surface-default"
 *
 * @example
 * jsNameToCssVar("LfThmBrandColorPrimary500")
 * // → "--lf-thm-brand-color-primary-500"
 */
function jsNameToCssVar(jsName) {
  const segments = [];
  let current = '';

  for (let i = 0; i < jsName.length; i++) {
    const ch = jsName[i];
    const isUpper = ch >= 'A' && ch <= 'Z';
    const isDigit = ch >= '0' && ch <= '9';
    const prevIsDigit = i > 0 && jsName[i - 1] >= '0' && jsName[i - 1] <= '9';

    if (isUpper && current.length > 0) {
      segments.push(current.toLowerCase());
      current = ch;
    } else if (isDigit && !prevIsDigit && current.length > 0) {
      segments.push(current.toLowerCase());
      current = ch;
    } else {
      current += ch;
    }
  }

  if (current.length > 0) {
    segments.push(current.toLowerCase());
  }

  return '--' + segments.join('-');
}

/**
 * Known compound words that use spaces in Figma paths.
 * When reversing a JS name back to a Figma path, these pairs of
 * consecutive segments are rejoined with a space.
 */
const COMPOUND_WORDS = ['On Surface', 'On Container', 'Neutral Alpha', 'Static Alpha', 'High Contrast'];

/**
 * Convert a JavaScript variable name back to a Figma token path.
 *
 * Removes the "LfThm" prefix, splits camelCase into segments, rejoins
 * known compound words (e.g. "On" + "Surface" → "On Surface"), and
 * joins the result with "/".
 *
 * This is the reverse of {@link figmaPathToJsName}. The round-trip
 * property holds: jsNameToFigmaPath(figmaPathToJsName(path)) === path
 *
 * @param {string} jsName - JS name, e.g. "LfThmDynamicPrimaryOnSurfaceDefault"
 * @returns {string} Figma path, e.g. "Dynamic/Primary/On Surface/Default"
 *
 * @example
 * jsNameToFigmaPath("LfThmDynamicPrimaryOnSurfaceDefault")
 * // → "Dynamic/Primary/On Surface/Default"
 */
function jsNameToFigmaPath(jsName) {
  // Remove "LfThm" prefix
  const withoutPrefix = jsName.replace(/^LfThm/, '');

  // Split camelCase into segments (uppercase or digit boundary)
  const rawSegments = [];
  let current = '';

  for (let i = 0; i < withoutPrefix.length; i++) {
    const ch = withoutPrefix[i];
    const isUpper = ch >= 'A' && ch <= 'Z';
    const isDigit = ch >= '0' && ch <= '9';
    const prevIsDigit = i > 0 && withoutPrefix[i - 1] >= '0' && withoutPrefix[i - 1] <= '9';

    if (isUpper && current.length > 0) {
      rawSegments.push(current);
      current = ch;
    } else if (isDigit && !prevIsDigit && current.length > 0) {
      rawSegments.push(current);
      current = ch;
    } else {
      current += ch;
    }
  }

  if (current.length > 0) {
    rawSegments.push(current);
  }

  // Build a set of compound-word first-words for quick lookup
  const compoundMap = {};
  for (const compound of COMPOUND_WORDS) {
    const parts = compound.split(' ');
    if (!compoundMap[parts[0]]) {
      compoundMap[parts[0]] = [];
    }
    compoundMap[parts[0]].push(parts.slice(1));
  }

  // Rejoin compound words and separate with "/"
  const figmaSegments = [];
  let idx = 0;

  while (idx < rawSegments.length) {
    const seg = rawSegments[idx];

    if (compoundMap[seg]) {
      // Try to match the longest compound word starting with this segment
      let matched = false;
      // Sort candidates by length descending to match longest first
      const candidates = compoundMap[seg].slice().sort(function (a, b) { return b.length - a.length; });

      for (const rest of candidates) {
        let allMatch = true;
        for (let j = 0; j < rest.length; j++) {
          if (idx + 1 + j >= rawSegments.length || rawSegments[idx + 1 + j] !== rest[j]) {
            allMatch = false;
            break;
          }
        }
        if (allMatch) {
          figmaSegments.push(seg + ' ' + rest.join(' '));
          idx += 1 + rest.length;
          matched = true;
          break;
        }
      }

      if (!matched) {
        figmaSegments.push(seg);
        idx++;
      }
    } else {
      figmaSegments.push(seg);
      idx++;
    }
  }

  return figmaSegments.join('/');
}

// ── ES5 generation helpers ───────────────────────────────────────────────────

/**
 * Escape a string for safe inclusion inside double-quoted ES5 string literals.
 * Escapes backslashes, double quotes, and newlines.
 *
 * @param {string} str - The string to escape
 * @returns {string} Escaped string safe for double-quoted JS literals
 */
function escapeString(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

/**
 * Serialize a value to ES5-compatible JavaScript source code.
 * Handles strings, numbers, booleans, null, arrays, and plain objects.
 * Uses only double-quoted strings and `var`-compatible syntax.
 *
 * @param {*} value - The value to serialize
 * @param {number} indent - Current indentation level
 * @returns {string} ES5-compatible source code representing the value
 */
function serializeES5Value(value, indent) {
  var pad = '';
  for (var p = 0; p < indent; p++) { pad += '  '; }
  var innerPad = pad + '  ';

  if (value === null || value === undefined) {
    return 'null';
  }
  if (typeof value === 'string') {
    return '"' + escapeString(value) + '"';
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }
    var items = [];
    for (var i = 0; i < value.length; i++) {
      items.push(innerPad + serializeES5Value(value[i], indent + 1));
    }
    return '[\n' + items.join(',\n') + '\n' + pad + ']';
  }
  if (typeof value === 'object') {
    var keys = Object.keys(value);
    if (keys.length === 0) {
      return '{}';
    }
    var entries = [];
    for (var k = 0; k < keys.length; k++) {
      var key = keys[k];
      // Use quoted key if it contains hyphens or special chars
      var keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : '"' + escapeString(key) + '"';
      entries.push(innerPad + keyStr + ': ' + serializeES5Value(value[key], indent + 1));
    }
    return '{\n' + entries.join(',\n') + '\n' + pad + '}';
  }
  return String(value);
}

// ── ES5 constants generation ────────────────────────────────────────────────

/**
 * Generate ES5-compatible JavaScript code containing GROUP_META,
 * GROUP_GUIDELINES, DECISION_TREE, and ROLE_MAPPING from the schema.
 *
 * The output uses only `var`, function(){}, string concatenation,
 * and .indexOf() — no arrow functions, const/let, template literals,
 * or .includes() calls.
 *
 * @param {Object} schema - Parsed token-schema.json
 * @returns {string} ES5-compatible JavaScript source code
 */
function generateES5Constants(schema) {
  var code = '';

  // ── GROUP_META ──
  code += 'var GROUP_META = {\n';

  var groupKeys = Object.keys(schema.groups);
  for (var gi = 0; gi < groupKeys.length; gi++) {
    var groupKey = groupKeys[gi];
    var group = schema.groups[groupKey];

    var meta = {
      label: group.label,
      color: group.color,
      description: group.description,
      examples: group.examples.join(', '),
      whenUse: group.whenUse,
      whenNotUse: group.whenNotUse,
      structure: Object.keys(group.roles),
      states: group.states,
      roles: group.roles,
      componentExamples: group.componentExamples || []
    };

    code += '  ' + groupKey + ': ' + serializeES5Value(meta, 1);
    code += (gi < groupKeys.length - 1) ? ',\n' : '\n';
  }

  code += '};\n\n';

  // ── GROUP_GUIDELINES ──
  code += 'var GROUP_GUIDELINES = {\n';

  for (var ggi = 0; ggi < groupKeys.length; ggi++) {
    var gKey = groupKeys[ggi];
    var grp = schema.groups[gKey];

    var doItems = [];
    for (var d = 0; d < grp.whenUse.length; d++) {
      doItems.push('Use em ' + grp.whenUse[d].toLowerCase());
    }

    var guidelines = {
      "do": doItems,
      dont: grp.whenNotUse
    };

    code += '  ' + gKey + ': ' + serializeES5Value(guidelines, 1);
    code += (ggi < groupKeys.length - 1) ? ',\n' : '\n';
  }

  code += '};\n\n';

  // ── DECISION_TREE ──
  code += 'var DECISION_TREE = ' + serializeES5Value(schema.decisionTree, 0) + ';\n\n';

  // ── ROLE_MAPPING ──
  code += 'var ROLE_MAPPING = ' + serializeES5Value(schema.roleMapping, 0) + ';\n';

  return code;
}

// ── ES5 validation ──────────────────────────────────────────────────────────

/**
 * Validate that a string of JavaScript code contains no ES6+ syntax.
 *
 * Checks for:
 *  - Arrow functions (=>)
 *  - .includes( calls
 *  - Template literals (backticks)
 *  - const or let declarations
 *  - Object.assign
 *  - Array.from
 *
 * @param {string} code - JavaScript source code to validate
 * @returns {{ valid: boolean, violations: Array<{line: number, rule: string, text: string}> }}
 */
function validateES5(code) {
  var violations = [];
  var lines = code.split('\n');

  var rules = [
    { pattern: /=>/, rule: 'Arrow function (=>)' },
    { pattern: /\.includes\s*\(/, rule: '.includes() call' },
    { pattern: /`/, rule: 'Template literal (backtick)' },
    { pattern: /\bconst\s/, rule: 'const declaration' },
    { pattern: /\blet\s/, rule: 'let declaration' },
    { pattern: /Object\.assign/, rule: 'Object.assign' },
    { pattern: /Array\.from/, rule: 'Array.from' }
  ];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    for (var r = 0; r < rules.length; r++) {
      if (rules[r].pattern.test(line)) {
        violations.push({
          line: i + 1,
          rule: rules[r].rule,
          text: line.trim()
        });
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations: violations
  };
}

// ── Detection helpers ────────────────────────────────────────────────────────

/**
 * Detect the role from a token's path parts.
 * Looks for known role keywords in the path segments.
 *
 * @param {string[]} pathParts - Array of path segments
 * @returns {string} Detected role or "unknown"
 */
function detectRole(pathParts) {
  const lowerParts = pathParts.map(function (p) { return p.toLowerCase(); });

  // Check compound roles first (order matters)
  for (let i = 0; i < lowerParts.length - 1; i++) {
    if (lowerParts[i] === 'on' && lowerParts[i + 1] === 'surface') return 'on-surface';
    if (lowerParts[i] === 'on' && lowerParts[i + 1] === 'container') return 'on-container';
  }

  const roleKeywords = ['surface', 'container', 'border', 'shadow', 'icon', 'text'];
  for (const part of lowerParts) {
    for (const keyword of roleKeywords) {
      if (part === keyword) return keyword;
    }
  }

  return 'unknown';
}

/**
 * Detect the hierarchy from a token's path parts.
 * Looks for known hierarchy keywords in the path segments.
 *
 * @param {string[]} pathParts - Array of path segments
 * @returns {string} Detected hierarchy or "unknown"
 */
function detectHierarchy(pathParts) {
  const lowerParts = pathParts.map(function (p) { return p.toLowerCase(); });
  const hierarchyKeywords = [
    'primary', 'secondary', 'tertiary', 'neutral', 'brand',
    'critical', 'success', 'warning', 'info', 'ghost'
  ];

  for (const part of lowerParts) {
    for (const keyword of hierarchyKeywords) {
      if (part === keyword) return keyword;
    }
  }

  return 'unknown';
}

/**
 * Detect the state from a token's path parts.
 * Looks for known state keywords in the path segments.
 * Defaults to "default" if no state keyword is found.
 *
 * @param {string[]} pathParts - Array of path segments
 * @returns {string} Detected state or "default"
 */
function detectState(pathParts) {
  const lowerParts = pathParts.map(function (p) { return p.toLowerCase(); });
  const stateKeywords = ['hover', 'active', 'focus', 'disabled', 'pressed', 'selected', 'error'];

  for (const part of lowerParts) {
    for (const keyword of stateKeywords) {
      if (part === keyword) return keyword;
    }
  }

  return 'default';
}

// ── HTML data generation (task 2.6) ─────────────────────────────────────────

/**
 * Generate the data object for docs/token-docs-data.json.
 *
 * Reads enriched tokens from the given path (if it exists) and combines
 * them with schema data to produce a comprehensive JSON structure for
 * the HTML standalone documentation.
 *
 * @param {Object} schema - Parsed token-schema.json
 * @param {string} enrichedTokensPath - Path to docs/tokens-figma-enriched.json
 * @returns {Object} JSON data for token-docs-data.json
 */
function generateHTMLData(schema, enrichedTokensPath) {
  // Load enriched tokens (if available)
  let enrichedTokens = [];
  try {
    const raw = fs.readFileSync(enrichedTokensPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.tokens)) {
      enrichedTokens = parsed.tokens;
    }
  } catch (_err) {
    // File doesn't exist or is invalid — proceed with empty tokens
  }

  const jsonData = {
    version: schema.version,
    generatedAt: new Date().toISOString(),
    groups: {},
    decisionTree: schema.decisionTree,
    aiRules: schema.aiRules,
    roleMapping: schema.roleMapping,
    naming: schema.naming,
    categories: schema.categories,
    layers: schema.layers
  };

  // For each group, combine schema data + enriched tokens
  const groupKeys = Object.keys(schema.groups);
  for (let gi = 0; gi < groupKeys.length; gi++) {
    const groupKey = groupKeys[gi];
    const groupSchema = schema.groups[groupKey];

    // Filter tokens belonging to this group based on first segment of Figma path
    const groupTokens = [];
    for (let ti = 0; ti < enrichedTokens.length; ti++) {
      const token = enrichedTokens[ti];
      if (!token.path) continue;

      // Path format in enriched file: "Dynamic / Critical / Surface / Default"
      const pathParts = token.path.split(' / ');
      const tokenGroup = pathParts[0].toLowerCase();

      if (tokenGroup === groupKey) {
        groupTokens.push({
          name: token.path,
          jsName: figmaPathToJsName(pathParts.join('/')),
          cssVar: jsNameToCssVar(figmaPathToJsName(pathParts.join('/'))),
          role: detectRole(pathParts),
          hierarchy: detectHierarchy(pathParts),
          state: detectState(pathParts),
          category: token.category || 'unknown',
          value: token.value || null
        });
      }
    }

    jsonData.groups[groupKey] = {
      label: groupSchema.label,
      color: groupSchema.color,
      description: groupSchema.description,
      examples: groupSchema.examples,
      whenUse: groupSchema.whenUse,
      whenNotUse: groupSchema.whenNotUse,
      roles: groupSchema.roles,
      hierarchies: groupSchema.hierarchies,
      states: groupSchema.states,
      componentExamples: groupSchema.componentExamples || [],
      tokens: groupTokens,
      tokenCount: groupTokens.length
    };
  }

  return jsonData;
}

// ── AI Markdown generation (task 2.7) ───────────────────────────────────────

/**
 * Generate structured Markdown for AI consumption from the schema.
 *
 * Produces a deterministic Markdown document with:
 *  - Deterministic rules table
 *  - Decision tree in structured text
 *  - Semantic group blocks with description, whenUse, whenNotUse, roles
 *  - Role mapping table
 *  - Naming conventions
 *
 * @param {Object} schema - Parsed token-schema.json
 * @returns {string} Formatted Markdown string
 */
function generateAIMarkdown(schema) {
  let md = '';

  md += '# Token Docs — Guia para IA\n\n';
  md += '> Gerado automaticamente a partir de token-schema.json\n\n';

  // ── Regras Determinísticas ──
  md += '## Regras Determinísticas\n\n';
  md += '| ID | Regra | Severidade |\n';
  md += '|----|-------|------------|\n';
  if (Array.isArray(schema.aiRules)) {
    for (let i = 0; i < schema.aiRules.length; i++) {
      const rule = schema.aiRules[i];
      md += '| ' + rule.id + ' | ' + rule.rule + ' | ' + rule.severity + ' |\n';
    }
  }
  md += '\n';

  // ── Árvore de Decisão ──
  md += '## Árvore de Decisão\n\n';
  md += renderDecisionTreeMarkdown(schema.decisionTree, 1, '');
  md += '\n';

  // ── Grupos Semânticos ──
  md += '## Grupos Semânticos\n\n';
  const groupKeys = Object.keys(schema.groups);
  for (let gi = 0; gi < groupKeys.length; gi++) {
    const groupKey = groupKeys[gi];
    const group = schema.groups[groupKey];

    md += '### ' + group.label + ' (' + groupKey + ')\n';
    md += '**Descrição**: ' + group.description + '\n';

    md += '**Quando usar**: ';
    md += group.whenUse.join('; ') + '\n';

    md += '**Quando NÃO usar**: ';
    md += group.whenNotUse.join('; ') + '\n';

    md += '**Roles**: ';
    const roleEntries = [];
    const roleKeys = Object.keys(group.roles);
    for (let ri = 0; ri < roleKeys.length; ri++) {
      const roleKey = roleKeys[ri];
      const role = group.roles[roleKey];
      roleEntries.push(roleKey + ' → ' + role.cssProperty);
    }
    md += roleEntries.join(', ') + '\n\n';
  }

  // ── Mapeamento de Roles ──
  md += '## Mapeamento de Roles\n\n';
  md += '| Role | CSS | Figma | Descrição |\n';
  md += '|------|-----|-------|----------|\n';
  if (schema.roleMapping) {
    const roleMappingKeys = Object.keys(schema.roleMapping);
    for (let ri = 0; ri < roleMappingKeys.length; ri++) {
      const roleKey = roleMappingKeys[ri];
      const mapping = schema.roleMapping[roleKey];
      md += '| ' + roleKey + ' | ' + mapping.css + ' | ' + mapping.figma + ' | ' + mapping.description + ' |\n';
    }
  }
  md += '\n';

  // ── Convenções de Nomenclatura ──
  md += '## Convenções de Nomenclatura\n\n';
  if (schema.naming) {
    md += '- Figma: ' + schema.naming.figmaPath + '\n';
    md += '- JavaScript: ' + schema.naming.camelCase + '\n';
    md += '- CSS: ' + schema.naming.cssCustomProperty + '\n';
  }
  md += '\n';

  return md;
}

/**
 * Recursively render a decision tree node as structured Markdown text.
 *
 * @param {Object} node - Decision tree node
 * @param {number} level - Current numbering level (1-based)
 * @param {string} indent - Current indentation string
 * @returns {string} Markdown text for this node and its children
 */
function renderDecisionTreeMarkdown(node, level, indent) {
  if (!node || typeof node !== 'object') return '';

  // Leaf node with result
  if (node.result) {
    return indent + '**' + node.result + '**\n';
  }

  let md = '';
  md += indent + level + '. ' + node.question + '\n';

  // YES branch
  if (node.yes) {
    if (node.yes.result) {
      md += indent + '   - SIM → **' + node.yes.result + '**\n';
    } else {
      md += indent + '   - SIM → ' + '\n';
      md += renderDecisionTreeMarkdown(node.yes, level + 1, indent + '     ');
    }
  }

  // NO branch
  if (node.no) {
    if (node.no.result) {
      md += indent + '   - NÃO → **' + node.no.result + '**\n';
    } else {
      md += indent + '   - NÃO → ' + '\n';
      md += renderDecisionTreeMarkdown(node.no, level + 1, indent + '     ');
    }
  }

  return md;
}

// ── Consistency validation (task 2.8) ───────────────────────────────────────

/**
 * Validate consistency across all 3 generated outputs.
 *
 * Checks:
 *  1. All group keys from schema appear in ES5 output, HTML JSON groups, and AI Markdown
 *  2. whenUse/whenNotUse arrays in HTML JSON are identical to schema
 *  3. All aiRules IDs appear in AI Markdown
 *  4. ES5 code passes validateES5()
 *
 * @param {Object} schema - Parsed token-schema.json (source of truth)
 * @param {string} es5Code - Generated ES5 code string
 * @param {Object} htmlJson - Generated HTML JSON data object
 * @param {string} aiMarkdown - Generated AI Markdown string
 * @returns {{ isConsistent: boolean, errors: string[], warnings: string[] }}
 */
function validateConsistency(schema, es5Code, htmlJson, aiMarkdown) {
  const errors = [];
  const warnings = [];

  const groupKeys = Object.keys(schema.groups);

  // 1. All group keys appear in all 3 outputs
  for (let i = 0; i < groupKeys.length; i++) {
    const groupKey = groupKeys[i];

    // Check ES5 output
    if (es5Code.indexOf(groupKey + ':') === -1 && es5Code.indexOf('"' + groupKey + '"') === -1) {
      errors.push('Group "' + groupKey + '" is missing from ES5 output');
    }

    // Check HTML JSON
    if (!htmlJson.groups || !htmlJson.groups[groupKey]) {
      errors.push('Group "' + groupKey + '" is missing from HTML JSON');
    }

    // Check AI Markdown
    if (aiMarkdown.indexOf(groupKey) === -1) {
      errors.push('Group "' + groupKey + '" is missing from AI Markdown');
    }
  }

  // 2. whenUse/whenNotUse arrays in HTML JSON are identical to schema
  for (let i = 0; i < groupKeys.length; i++) {
    const groupKey = groupKeys[i];
    const schemaGroup = schema.groups[groupKey];
    const htmlGroup = htmlJson.groups && htmlJson.groups[groupKey];

    if (htmlGroup) {
      // Check whenUse length and content
      if (!Array.isArray(htmlGroup.whenUse) || htmlGroup.whenUse.length !== schemaGroup.whenUse.length) {
        errors.push('whenUse length mismatch for group "' + groupKey + '"');
      } else {
        for (let j = 0; j < schemaGroup.whenUse.length; j++) {
          if (schemaGroup.whenUse[j] !== htmlGroup.whenUse[j]) {
            errors.push('whenUse[' + j + '] mismatch for group "' + groupKey + '": expected "' + schemaGroup.whenUse[j] + '", got "' + htmlGroup.whenUse[j] + '"');
          }
        }
      }

      // Check whenNotUse length and content
      if (!Array.isArray(htmlGroup.whenNotUse) || htmlGroup.whenNotUse.length !== schemaGroup.whenNotUse.length) {
        errors.push('whenNotUse length mismatch for group "' + groupKey + '"');
      } else {
        for (let j = 0; j < schemaGroup.whenNotUse.length; j++) {
          if (schemaGroup.whenNotUse[j] !== htmlGroup.whenNotUse[j]) {
            errors.push('whenNotUse[' + j + '] mismatch for group "' + groupKey + '": expected "' + schemaGroup.whenNotUse[j] + '", got "' + htmlGroup.whenNotUse[j] + '"');
          }
        }
      }
    }
  }

  // 3. All aiRules IDs appear in AI Markdown
  if (Array.isArray(schema.aiRules)) {
    for (let i = 0; i < schema.aiRules.length; i++) {
      const rule = schema.aiRules[i];
      if (aiMarkdown.indexOf(rule.id) === -1) {
        errors.push('AI rule "' + rule.id + '" is missing from AI Markdown');
      }
    }
  }

  // 4. ES5 code passes validateES5()
  const es5Report = validateES5(es5Code);
  if (!es5Report.valid) {
    for (let i = 0; i < es5Report.violations.length; i++) {
      const v = es5Report.violations[i];
      errors.push('ES5 violation at line ' + v.line + ': ' + v.rule + ' — ' + v.text);
    }
  }

  return {
    isConsistent: errors.length === 0,
    errors: errors,
    warnings: warnings
  };
}

// ── Main execution ──────────────────────────────────────────────────────────

/**
 * Main pipeline entry point.
 * Reads the schema, validates it, generates all outputs, and validates consistency.
 */
function main() {
  console.log('Reading token-schema.json...');
  const schema = readSchema();

  console.log('Validating schema...');
  const report = validateSchema(schema);

  // Print validation results
  if (report.errors.length > 0) {
    console.error('\n✗ Validation ERRORS (' + report.errors.length + '):');
    report.errors.forEach(function (err) {
      console.error('  • ' + err);
    });
  }

  if (report.warnings.length > 0) {
    console.warn('\n⚠ Validation WARNINGS (' + report.warnings.length + '):');
    report.warnings.forEach(function (warn) {
      console.warn('  • ' + warn);
    });
  }

  if (report.errors.length > 0) {
    console.error('\nAborting due to validation errors.');
    process.exit(1);
  }

  if (report.errors.length === 0 && report.warnings.length === 0) {
    console.log('\n✓ Schema is valid — no errors, no warnings.');
  } else {
    console.log('\n✓ Schema is valid (with ' + report.warnings.length + ' warning(s)).');
  }

  // ── Generate ES5 constants ──
  console.log('\nGenerating ES5 constants...');
  const es5Code = generateES5Constants(schema);
  const es5Report = validateES5(es5Code);

  if (!es5Report.valid) {
    console.error('\n✗ ES5 violations found (' + es5Report.violations.length + '):');
    es5Report.violations.forEach(function (v) {
      console.error('  • Line ' + v.line + ': ' + v.rule + ' — ' + v.text);
    });
    console.error('\nAborting — generated ES5 code contains prohibited syntax.');
    process.exit(1);
  }

  const es5OutputPath = path.join(__dirname, 'generated-es5-constants.js');
  fs.writeFileSync(es5OutputPath, es5Code, 'utf8');
  console.log('✓ ES5 constants written to scripts/generated-es5-constants.js');

  // ── Generate HTML data (token-docs-data.json) ──
  console.log('\nGenerating HTML data (token-docs-data.json)...');
  const enrichedTokensPath = path.join(__dirname, '..', 'docs', 'tokens-figma-enriched.json');
  const htmlJson = generateHTMLData(schema, enrichedTokensPath);
  const htmlOutputPath = path.join(__dirname, '..', 'docs', 'token-docs-data.json');
  fs.writeFileSync(htmlOutputPath, JSON.stringify(htmlJson, null, 2), 'utf8');
  console.log('✓ HTML data written to docs/token-docs-data.json');

  // ── Generate AI Markdown (token-docs-ai.md) ──
  console.log('\nGenerating AI Markdown (token-docs-ai.md)...');
  const aiMarkdown = generateAIMarkdown(schema);
  const aiOutputPath = path.join(__dirname, '..', 'docs', 'token-docs-ai.md');
  fs.writeFileSync(aiOutputPath, aiMarkdown, 'utf8');
  console.log('✓ AI Markdown written to docs/token-docs-ai.md');

  // ── Validate consistency across all outputs ──
  console.log('\nValidating consistency across all outputs...');
  const consistencyReport = validateConsistency(schema, es5Code, htmlJson, aiMarkdown);

  if (consistencyReport.warnings.length > 0) {
    console.warn('\n⚠ Consistency WARNINGS (' + consistencyReport.warnings.length + '):');
    consistencyReport.warnings.forEach(function (warn) {
      console.warn('  • ' + warn);
    });
  }

  if (!consistencyReport.isConsistent) {
    console.error('\n✗ Consistency ERRORS (' + consistencyReport.errors.length + '):');
    consistencyReport.errors.forEach(function (err) {
      console.error('  • ' + err);
    });
    console.error('\nAborting — outputs are inconsistent.');
    process.exit(1);
  }

  console.log('✓ All outputs are consistent.');
  console.log('\n✅ Pipeline complete — 3 artifacts generated successfully.');
}

// Run main only when executed directly
if (require.main === module) {
  main();
}

module.exports = { readSchema, validateSchema, figmaPathToJsName, jsNameToCssVar, jsNameToFigmaPath, generateES5Constants, validateES5, detectRole, detectHierarchy, detectState, generateHTMLData, generateAIMarkdown, validateConsistency };
