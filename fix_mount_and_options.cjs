const fs = require('fs');
const path = require('path');

// 1. AdminCompaniesPage.tsx
const compPath = path.join(__dirname, 'src/pages/admin/AdminCompaniesPage.tsx');
let comp = fs.readFileSync(compPath, 'utf8');

// Insert mount useEffect right after loadCompanies definition
if (!comp.includes('useEffect(() => {\n    loadCompanies();\n  }, []);')) {
  comp = comp.replace(
    /const loadCompanies = async \(\) => \{[\s\S]*?setIsRefreshing\(false\);\s*\}\s*;\s*\n/,
    (match) => match + '\n  useEffect(() => {\n    loadCompanies();\n  }, []);\n'
  );
}

// Replace inline options with userOptions and companyOptions
comp = comp.replace(
  /options=\{\[\s*\{\s*value:\s*'ALL',\s*label:\s*'All Brokers \/ Users \(Default\)'\s*\},[\s\S]*?\.\.\.users\.map[\s\S]*?\}\]\}/,
  'options={userOptions}'
);

comp = comp.replace(
  /options=\{\[\s*\{\s*value:\s*'ALL',\s*label:\s*'All Companies \(Default\)'\s*\},[\s\S]*?\.\.\.companies[\s\S]*?\}\]\}/,
  'options={companyOptions}'
);

fs.writeFileSync(compPath, comp, 'utf8');
console.log('✓ AdminCompaniesPage.tsx fixed with mount useEffect and options');

// 2. AdminPartiesPage.tsx
const partiesPath = path.join(__dirname, 'src/pages/admin/AdminPartiesPage.tsx');
let parties = fs.readFileSync(partiesPath, 'utf8');

if (!parties.includes('useEffect(() => {\n    loadParties();\n  }, []);')) {
  parties = parties.replace(
    /const loadParties = async \(\) => \{[\s\S]*?setIsRefreshing\(false\);\s*\}\s*;\s*\n/,
    (match) => match + '\n  useEffect(() => {\n    loadParties();\n  }, []);\n'
  );
}

parties = parties.replace(
  /options=\{\[\s*\{\s*value:\s*'ALL',\s*label:\s*'All Brokers \/ Users \(Default\)'\s*\},[\s\S]*?\.\.\.users\.map[\s\S]*?\}\]\}/,
  'options={userOptions}'
);

fs.writeFileSync(partiesPath, parties, 'utf8');
console.log('✓ AdminPartiesPage.tsx fixed with mount useEffect and options');

// 3. AdminItemsPage.tsx
const itemsPath = path.join(__dirname, 'src/pages/admin/AdminItemsPage.tsx');
let items = fs.readFileSync(itemsPath, 'utf8');

if (!items.includes('useEffect(() => {\n    loadItems();\n  }, []);')) {
  items = items.replace(
    /const loadItems = async \(\) => \{[\s\S]*?setIsRefreshing\(false\);\s*\}\s*;\s*\n/,
    (match) => match + '\n  useEffect(() => {\n    loadItems();\n  }, []);\n'
  );
}

items = items.replace(
  /options=\{\[\s*\{\s*value:\s*'ALL',\s*label:\s*'All Brokers \/ Users \(Default\)'\s*\},[\s\S]*?\.\.\.users\.map[\s\S]*?\}\]\}/,
  'options={userOptions}'
);

fs.writeFileSync(itemsPath, items, 'utf8');
console.log('✓ AdminItemsPage.tsx fixed with mount useEffect and options');
