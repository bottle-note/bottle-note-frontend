import fs from 'node:fs';
const out='design/editorial-redesign';
const pages=JSON.parse(fs.readFileSync(out+'/page-list.json'));
for(const [page,[file,path]] of Object.entries(pages)){
fs.writeFileSync(`${out}/${file}.html`,`<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>보틀노트</title><link rel="stylesheet" href="colors.css"><link rel="stylesheet" href="semantic-colors.css"><link rel="stylesheet" href="product-ui.css"><link rel="stylesheet" href="layout.css"><link rel="stylesheet" href="responsive.css"><link rel="stylesheet" href="collections.css"><link rel="stylesheet" href="imports.css"></head><body><div id="app"></div><dialog id="dialog"><div id="dialog-content"></div><button class="button" data-close>확인</button></dialog><div class="toast" role="status" hidden></div><script>window.BN_PAGE=${JSON.stringify(page)};window.BN_PRODUCT_PATH=${JSON.stringify(path)};</script><script src="data.js"></script><script src="icons.js"></script><script src="real-ui.js"></script><script src="src/collections.js"></script><script src="src/imports.js"></script><script src="src/pages.js"></script></body></html>`);
}
console.log('Exported '+Object.keys(pages).length+' page documents');
