tabs[] + activeIdx——多标签页状态。
每个 tab 对象包含：id（唯一标识）、filePath（文件路径）、title（标题）、content（内容快照，切换时用于恢复）、isDirty（未保存标记）。
activateTab(idx) 将当前标签内容快照保存至 tabs[currentIdx].content，然后将目标标签内容通过 editorRef.setValue() 加载至编辑器，并更新 activeIdx 和 currentFile。
