# todo-manager
My todo manager tool


## init app
```shell
pnpm init
pnpm install electron --save-dev
# create main.js,  renderer.js, index.html
# configure package.json

# start 
pnpm start
```

## integrate electron-vite
```shell
# https://cn.electron-vite.org/guide/
pnpm install electron-vite --save-dev 
# configure electron.vite.config.js
```

## integrate typescript
```shell
pnpm install typescript --save-dev
# configure tsconfig.json
# change main.js, preload.js to main.ts, preload.ts
```
## 

## integrate electron-builder
```shell
# https://www.electron.build/
pnpm install electron-builder --save-dev
# configure package.json
```

## integrate react
install react and react-dom and related typescript types
```shell
pnpm install react react-dom --save-dev
pnpm install --save-dev @types/react
pnpm install --save-dev @types/react-dom
```
put react related files in src/*
tsc build react ts files, home is in main.tsx, others are divided into components
tsc will build ts to js into src folder
try reload vscode if tsc works while vscode still report error

now we can use react in main.tsx under src folder, next we need to import react in index.html.
add `<script type="module" src="/src/main.tsx"></script>` in index.html in project root directory.
config `include`, in tsconfig.json will to build ts, replace the reference path in main process for `preload.ts` and `index.html` if you changed directory structure.

