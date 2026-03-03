/**
 * Valida que o workflow de CI contém os passos obrigatórios (lint, format:check, test, build).
 * Uso: node scripts/validate-workflow.cjs
 */
const fs = require("fs");
const path = require("path");

const workflowPath = path.join(__dirname, "..", ".github", "workflows", "ci.yml");

if (!fs.existsSync(workflowPath)) {
  console.error("Erro: arquivo .github/workflows/ci.yml não encontrado.");
  process.exit(1);
}

const content = fs.readFileSync(workflowPath, "utf8");

const required = [
  "npm run lint",
  "npm run format:check",
  "npm test",
  "npm run build",
];

const missing = required.filter((cmd) => !content.includes(cmd));

if (missing.length > 0) {
  console.error(
    "Erro: workflow de CI não contém os comandos obrigatórios:",
    missing.join(", ")
  );
  process.exit(1);
}

if (!content.includes("name: CI") && !content.includes('name: "CI"')) {
  console.error("Erro: workflow deve ter name: CI.");
  process.exit(1);
}

console.log("Validação do workflow CI: OK.");
process.exit(0);
