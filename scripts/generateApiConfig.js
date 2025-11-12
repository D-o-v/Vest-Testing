const fs = require('fs')
const path = require('path')

const collectionPath = path.resolve(__dirname, '../vess-testin-postmacollection.json')
const outPath = path.resolve(__dirname, '../lib/services/apiConfig.ts')

function sanitizePath(raw) {
  // Convert Postman's url.raw with {{baseUrl}} to path only
  return raw.replace(/\{\{baseUrl\}\}/g, '').trim()
}

function walkItems(items, parent = []) {
  const routes = []
  for (const it of items || []) {
    if (it.item) {
      routes.push(...walkItems(it.item, parent.concat(it.name)))
    }
    if (it.request && it.request.url && it.request.url.raw) {
      const key = parent.concat(it.name).join('.').replace(/[\s\/\\:]+/g, '_')
      routes.push({
        key,
        name: it.name,
        method: it.request.method,
        raw: it.request.url.raw,
        headers: (it.request.header || []).map(h => ({ key: h.key, value: h.value }))
      })
    }
  }
  return routes
}

function main() {
  try {
    if (!fs.existsSync(collectionPath)) {
      throw new Error(`Collection file not found: ${collectionPath}`);
    }

    const raw = fs.readFileSync(collectionPath, 'utf8');
    const json = JSON.parse(raw);
    const items = json.item || [];
    const routes = walkItems(items);

    const lines = [];
    lines.push('// GENERATED from vess-testin-postmacollection.json — run scripts/generateApiConfig.js to refresh');
    lines.push('export const API_CONFIG = {');
    
    for (const route of routes) {
      const sanitizedPath = sanitizePath(route.raw);
      lines.push(`  "${route.key}": { method: "${route.method}", path: "${sanitizedPath}", headers: ${JSON.stringify(route.headers)} },`);
    }
    
    lines.push('} as const');

    fs.writeFileSync(outPath, lines.join('\n') + '\n');
    console.log(`Successfully wrote ${outPath} with ${routes.length} routes`);
  } catch (error) {
    const msg = error && error.message ? error.message : String(error)
    console.error('Error generating API config:', msg)
    process.exit(1)
  }
}

if (require.main === module) main()
