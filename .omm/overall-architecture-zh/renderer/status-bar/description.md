src/components/StatusBar.jsx——纯展示组件，无内部状态。
接收 App.jsx 传入的 wordCount、charCount、mode（编辑模式）、currentFile（当前文件路径）并渲染在底部状态栏。
字数/字符数统计在 App.jsx 中以 300ms 防抖更新后传入。
