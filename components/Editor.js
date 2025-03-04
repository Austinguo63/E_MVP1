import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import styles from '../styles/Editor.module.css';

const Editor = forwardRef(({ isGenerating, isPaused }, ref) => {
  const editorDivRef = useRef(null);
  
  // Expose the editor div to the parent component
  useImperativeHandle(ref, () => editorDivRef.current);
  
  // Add a blinking cursor effect when generating content
  useEffect(() => {
    if (!editorDivRef.current) return;
    
    if (isGenerating && !isPaused) {
      editorDivRef.current.classList.add(styles.generating);
    } else {
      editorDivRef.current.classList.remove(styles.generating);
    }
  }, [isGenerating, isPaused]);
  
  return (
    <div className={styles.editorWrapper}>
      <div 
        ref={editorDivRef}
        className={styles.editor} 
        contentEditable={!isGenerating || isPaused}
        suppressContentEditableWarning={true}
      >
        <h1 className={styles.documentTitle}>商业计划书</h1>
        <p className={styles.documentIntro}>
          {!isGenerating && !isPaused && '点击"开始生成"按钮，AI将为您创建一份完整的商业计划书。您可以随时暂停并编辑内容。'}
        </p>
      </div>
      
      {isGenerating && !isPaused && (
        <div className={styles.generatingIndicator}>
          AI正在生成内容...
        </div>
      )}
      
      {isPaused && (
        <div className={styles.pausedIndicator}>
          生成已暂停，您可以编辑内容或点击"继续生成"
        </div>
      )}
    </div>
  );
});

Editor.displayName = 'Editor';

export default Editor;
