# Contribute

First you should install [EditorConfig](http://editorconfig.org/) package in your code editor. Then,

```
cd .git/hooks
ln -s ../../hooks/pre-commit

npm install
```

Then 2 commands are available :
- `npm run watch` watch js files
- `npm run build` clean, build and uglify js files
