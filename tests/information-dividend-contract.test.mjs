import fs from 'node:fs';
import assert from 'node:assert/strict';

const system = JSON.parse(fs.readFileSync('contracts/information-dividend-system.json', 'utf8'));
const catalog = JSON.parse(fs.readFileSync('data/information-dividend/catalog.sample.json', 'utf8'));
const gates = JSON.parse(fs.readFileSync('data/information-dividend/production-gates.sample.json', 'utf8'));
const rag = JSON.parse(fs.readFileSync('data/information-dividend/rag-eval-seed.json', 'utf8'));

assert.ok(system.dataset_families.length >= 4, 'expected at least four dataset families');
assert.ok(system.evidence_objects.includes('outcome'), 'outcome evidence is required');
assert.ok(system.production_gate.rag.includes('citation_eval'), 'RAG citation gate is required');
assert.ok(system.production_gate.ml.includes('leakage_safe_validation'), 'ML leakage-safe validation is required');

for (const dataset of catalog.datasets) {
  assert.ok(dataset.id && dataset.family && dataset.grain && dataset.privacy, `invalid dataset contract: ${dataset.id}`);
  assert.ok(dataset.dividend, `dataset must state its recurring informational dividend: ${dataset.id}`);
}

for (const s of gates.systems) {
  assert.notEqual(s.gate, 'PRODUCTION_VERIFIED', `${s.id} must not be production-verified without runtime evidence`);
}

assert.ok(rag.cases.some(c => c.must_abstain === true), 'RAG suite must test abstention');
assert.ok(rag.cases.some(c => c.expected_evidence?.length), 'RAG suite must test grounded evidence retrieval');

console.log('information-dividend contract tests: OK');
