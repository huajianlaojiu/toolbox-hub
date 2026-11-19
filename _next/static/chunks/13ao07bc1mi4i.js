(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,72382,15281,e=>{"use strict";var l=e.i(56420);let a=(0,l.default)("eye",[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);e.s(["Eye",0,a],72382);let t=(0,l.default)("pencil",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]]);e.s(["Pencil",0,t],15281)},37126,e=>{"use strict";var l=e.i(43476),a=e.i(71645),t=e.i(72382),r=e.i(15281),o=e.i(33499);e.s(["default",0,function(){let{t:e}=(0,o.useI18n)(),[s,c]=(0,a.useState)(`# Welcome to Markdown

**Bold text** and *italic text*.

## Features
- Lists work
- [Links work](https://example.com)
- \`inline code\`

\`\`\`js
console.log("code blocks too");
\`\`\`

> Blockquotes are supported.

| Table | Works |
|-------|-------|
| Row 1 | Value |
`),[n,i]=(0,a.useState)(!1);return(0,l.jsxs)("div",{className:"space-y-4",children:[(0,l.jsxs)("div",{className:"flex gap-2",children:[(0,l.jsxs)("button",{onClick:()=>i(!1),className:`tool-btn ${!n?"tool-btn-primary":"tool-btn-secondary"}`,children:[(0,l.jsx)(r.Pencil,{className:"h-4 w-4"}),"Edit"]}),(0,l.jsxs)("button",{onClick:()=>i(!0),className:`tool-btn ${n?"tool-btn-primary":"tool-btn-secondary"}`,children:[(0,l.jsx)(t.Eye,{className:"h-4 w-4"}),e("Preview")]})]}),n?(0,l.jsx)("div",{className:"rounded-lg border bg-card p-6 prose prose-sm max-w-none dark:prose-invert",dangerouslySetInnerHTML:{__html:s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/^### (.+)$/gm,"<h3>$1</h3>").replace(/^## (.+)$/gm,"<h2>$1</h2>").replace(/^# (.+)$/gm,"<h1>$1</h1>").replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`{3}(\w*)\n([\s\S]*?)`{3}/g,"<pre><code>$2</code></pre>").replace(/`(.+?)`/g,"<code>$1</code>").replace(/^> (.+)$/gm,"<blockquote>$1</blockquote>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.*<\/li>\n?)+/g,"<ul>$&</ul>").replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>').replace(/\n\n/g,"</p><p>").replace(/^(.+)$/gm,e=>e.startsWith("<")?e:"<p>"+e+"</p>")}}):(0,l.jsx)("textarea",{className:"tool-input",style:{minHeight:400},value:s,onChange:e=>c(e.target.value),placeholder:"Write Markdown here..."})]})}])}]);