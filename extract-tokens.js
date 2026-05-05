/**
 * extract-tokens.js
 * Extrai tokens do pacote @lift/ds-tokens e gera um JSON
 * para ser colado no plugin Token Docs.
 *
 * Uso: node extract-tokens.js > tokens-storybook.json
 */

var fs = require("fs");
var path = require("path");

var output = {};

// Tenta carregar os arquivos de tokens do pacote
var basePaths = [
  "./node_modules/@lift/ds-tokens",
  "./node_modules/@lift/ds-web/node_modules/@lift/ds-tokens",
  "./node_modules/@lift/ds-web",
  "./node_modules/@lift/design-system-react-web/node_modules/@lift/ds-tokens",
  "./node_modules/@lift/design-system-react-web"
];

var brands = ["estacio", "wyden"];
var themes = ["default", "high-contrast"];

function hexFromRgb(r, g, b) {
  return "#" + [r, g, b].map(function(v) {
    return Math.round(v * 255).toString(16).padStart(2, "0");
  }).join("").toUpperCase();
}

function flattenTokens(obj, prefix) {
  var result = {};
  if (!obj || typeof obj !== "object") return result;
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var v = obj[k];
    var fullKey = prefix ? prefix + "/" + k : k;
    if (v && typeof v === "object") {
      if (v.value !== undefined) {
        // Style Dictionary format: { value: "#hex" }
        var val = v.value;
        if (typeof val === "string" && val.match(/^#[0-9a-fA-F]{3,8}$/)) {
          result[fullKey] = val.toUpperCase();
        } else if (typeof val === "object" && val.r !== undefined) {
          result[fullKey] = hexFromRgb(val.r, val.g, val.b);
        } else if (typeof val === "string") {
          result[fullKey] = val;
        }
      } else if (v.r !== undefined && v.g !== undefined && v.b !== undefined) {
        // Raw RGB object
        result[fullKey] = hexFromRgb(v.r, v.g, v.b);
      } else {
        // Nested object — recurse
        var nested = flattenTokens(v, fullKey);
        var nKeys = Object.keys(nested);
        for (var ni = 0; ni < nKeys.length; ni++) {
          result[nKeys[ni]] = nested[nKeys[ni]];
        }
      }
    } else if (typeof v === "string" && v.match(/^#[0-9a-fA-F]{3,8}$/)) {
      result[fullKey] = v.toUpperCase();
    }
  }
  return result;
}

var found = false;

for (var bi = 0; bi < basePaths.length; bi++) {
  var basePath = basePaths[bi];
  if (!fs.existsSync(basePath)) continue;

  for (var bri = 0; bri < brands.length; bri++) {
    var brand = brands[bri];
    for (var ti = 0; ti < themes.length; ti++) {
      var theme = themes[ti];

      // Tenta diferentes extensões e caminhos
      var candidates = [
        path.join(basePath, "brands", brand, "ts", theme + ".js"),
        path.join(basePath, "brands", brand, "ts", theme + ".cjs"),
        path.join(basePath, "brands", brand, "json", theme + ".json"),
        path.join(basePath, brand, theme + ".js"),
        path.join(basePath, brand + "-" + theme + ".js"),
        path.join(basePath, "dist", brand, theme + ".js"),
        path.join(basePath, "tokens", brand, theme + ".json")
      ];

      for (var ci = 0; ci < candidates.length; ci++) {
        var filePath = candidates[ci];
        if (!fs.existsSync(filePath)) continue;

        try {
          var tokens;
          if (filePath.endsWith(".json")) {
            tokens = JSON.parse(fs.readFileSync(filePath, "utf8"));
          } else {
            tokens = require(path.resolve(filePath));
            // ES module default export
            if (tokens && tokens.default) tokens = tokens.default;
          }

          var flat = flattenTokens(tokens, "");
          var flatKeys = Object.keys(flat);
          if (flatKeys.length > 0) {
            var key = brand + "/" + theme;
            output[key] = flat;
            console.error("Found " + flatKeys.length + " tokens in " + filePath);
            found = true;
          }
        } catch(e) {
          // silently skip
        }
      }
    }
  }

  // Também tenta o index principal do pacote
  var indexCandidates = [
    path.join(basePath, "index.js"),
    path.join(basePath, "dist", "index.js"),
    path.join(basePath, "tokens.js"),
    path.join(basePath, "tokens.json")
  ];

  for (var ic = 0; ic < indexCandidates.length; ic++) {
    if (!fs.existsSync(indexCandidates[ic])) continue;
    try {
      var idx = require(path.resolve(indexCandidates[ic]));
      if (idx && idx.default) idx = idx.default;
      var flat2 = flattenTokens(idx, "");
      if (Object.keys(flat2).length > 0) {
        output["index"] = flat2;
        console.error("Found " + Object.keys(flat2).length + " tokens in " + indexCandidates[ic]);
        found = true;
      }
    } catch(e) {}
  }
}

if (!found) {
  // Lista o que tem no pacote para diagnóstico
  for (var bi2 = 0; bi2 < basePaths.length; bi2++) {
    if (!fs.existsSync(basePaths[bi2])) continue;
    console.error("Package found at: " + basePaths[bi2]);
    try {
      var pkg = JSON.parse(fs.readFileSync(path.join(basePaths[bi2], "package.json"), "utf8"));
      console.error("Package name:", pkg.name, "version:", pkg.version);
      console.error("Main:", pkg.main);
      console.error("Exports:", JSON.stringify(pkg.exports || {}, null, 2).slice(0, 500));
    } catch(e) {}
    // Lista arquivos
    function listFiles(dir, depth) {
      if (depth > 3) return;
      try {
        var files = fs.readdirSync(dir);
        files.forEach(function(f) {
          var full = path.join(dir, f);
          var stat = fs.statSync(full);
          if (stat.isDirectory()) {
            console.error("  DIR: " + full.replace(basePaths[bi2], ""));
            listFiles(full, depth + 1);
          } else if (f.endsWith(".js") || f.endsWith(".json") || f.endsWith(".ts")) {
            console.error("  FILE: " + full.replace(basePaths[bi2], ""));
          }
        });
      } catch(e) {}
    }
    listFiles(basePaths[bi2], 0);
  }
  console.error("No tokens found. Check the paths above.");
  process.exit(1);
}

// Saída: JSON plano com todos os tokens de todas as brands/themes
// Formato: { "Brand/Color/Primary/500": { "estacio/default": "#hex", "estacio/high-contrast": "#hex" } }
var merged = {};
var outputKeys = Object.keys(output);
for (var oi = 0; oi < outputKeys.length; oi++) {
  var brandTheme = outputKeys[oi];
  var tokens2 = output[brandTheme];
  var tKeys = Object.keys(tokens2);
  for (var tki = 0; tki < tKeys.length; tki++) {
    var tk = tKeys[tki];
    if (!merged[tk]) merged[tk] = {};
    merged[tk][brandTheme] = tokens2[tk];
  }
}

// Também gera versão simples (só default do estacio)
var simple = {};
var simpleSource = output["estacio/default"] || output["index"] || {};
var simpleKeys = Object.keys(simpleSource);
for (var si = 0; si < simpleKeys.length; si++) {
  simple[simpleKeys[si]] = simpleSource[simpleKeys[si]];
}

console.log(JSON.stringify(simple, null, 2));
console.error("\nTotal tokens (simple): " + simpleKeys.length);
console.error("Total tokens (merged): " + Object.keys(merged).length);
console.error("\nTo use in plugin: copy the JSON above and paste in 'Colar JSON' field");
