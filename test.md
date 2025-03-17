```bash
Get-ChildItem -Path .\ -Filter "\*.tgz" | Remove-Item -Force
if (Test-Path dist) { Remove-Item -Recurse -Force dist }

bun run build
npm pack
cd .\test-project\

if (Test-Path .vitepress\cache) { Remove-Item -Recurse -Force .vitepress\cache }
if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }

bun i
bun remove vitepress-mermaid-renderer
bun add ../vitepress-mermaid-renderer-1.0.7.tgz

bun run docs:dev
```
