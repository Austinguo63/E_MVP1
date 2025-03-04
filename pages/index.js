import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Editor from '../components/Editor';
import AISidebar from '../components/AISidebar';

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const editorRef = useRef(null);

  // Mock document structure for demonstration
  const documentStructure = [
    { title: '项目背景', content: '' },
    { title: '市场分析', content: '' },
    { title: '商业模式', content: '' },
    { title: '财务预测', content: '' },
    { title: '风险分析', content: '' },
    { title: '团队介绍', content: '' },
    { title: '发展规划', content: '' }
  ];

  const handleStartGeneration = () => {
    setIsGenerating(true);
    setIsPaused(false);
    generateContent();
  };

  const handlePauseGeneration = () => {
    setIsPaused(true);
    setIsGenerating(false);
  };

  const handleContinueGeneration = () => {
    setIsPaused(false);
    setIsGenerating(true);
    generateContent();
  };

  const generateContent = async () => {
    // Start from the current position or from the beginning
    const startIndex = currentPosition || 0;
    
    for (let i = startIndex; i < documentStructure.length; i++) {
      if (!isGenerating || isPaused) break;
      
      setCurrentPosition(i);
      
      // Generate content for each section using the API
      await streamSectionContent(documentStructure[i].title, i);
    }
    
    setIsGenerating(false);
  };

  const streamSectionContent = async (sectionTitle, index) => {
    // Get any existing content for this section to continue from
    let continueFrom = '';
    const existingContentDiv = document.getElementById(`content-${index}`);
    if (existingContentDiv) {
      continueFrom = existingContentDiv.textContent;
    }
    
    if (editorRef.current) {
      // Create section heading if it doesn't exist
      if (!document.getElementById(`section-${index}`)) {
        const sectionHeading = document.createElement('h2');
        sectionHeading.id = `section-${index}`;
        sectionHeading.textContent = sectionTitle;
        editorRef.current.appendChild(sectionHeading);
      }
      
      // Create or find content div
      let contentDiv = document.getElementById(`content-${index}`);
      if (!contentDiv) {
        contentDiv = document.createElement('div');
        contentDiv.id = `content-${index}`;
        editorRef.current.appendChild(contentDiv);
      }
      
      try {
        // Call the API with streaming enabled
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            section: sectionTitle,
            continueFrom: continueFrom.trim() || null
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        // Process the streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
          if (!isGenerating || isPaused) break;
          
          const { done, value } = await reader.read();
          if (done) break;
          
          // Decode the chunk and split by lines
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.error) {
                  console.error('Error from API:', data.error);
                  break;
                }
                
                if (data.done) {
                  // Add citation if provided
                  if (data.citation) {
                    const citation = document.createElement('p');
                    citation.className = styles.citation;
                    citation.innerHTML = `数据来源: <a href="${data.citation.url}" target="_blank">${data.citation.text}</a>`;
                    editorRef.current.appendChild(citation);
                  }
                  break;
                }
                
                if (data.content) {
                  contentDiv.textContent += data.content;
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error streaming content:', error);
        contentDiv.textContent += '\n[内容生成出错，请重试]';
      }
    }
  };

  const getMockContentForSection = (sectionTitle) => {
    // Mock content for each section
    const mockContent = {
      '项目背景': '本项目旨在解决当前市场中存在的文档编辑与AI辅助生成的结合问题。随着AI技术的发展，越来越多的用户希望能够利用AI来辅助文档创作，但现有的解决方案往往缺乏灵活性和交互性。',
      '市场分析': '根据最新市场调研，AI辅助写作工具市场规模预计在2025年达到50亿美元，年增长率约为35%。卢旺达农业GDP预计增长5%，这表明新兴市场对技术解决方案的需求正在增加。',
      '商业模式': '我们采用SaaS订阅模式，提供基础版和专业版两种套餐。基础版面向个人用户，专业版针对企业用户提供更多高级功能和API集成能力。同时，我们将通过API授权给第三方开发者创造额外收入来源。',
      '财务预测': '基于市场分析和用户增长预测，我们预计第一年营收达到100万美元，第三年突破500万美元。初期投资主要用于技术开发和市场推广，预计18个月内实现盈亏平衡。',
      '风险分析': '主要风险包括技术实现难度、市场竞争加剧以及用户隐私保护等合规问题。我们已制定相应的风险应对策略，包括技术储备、差异化竞争策略以及严格的数据安全措施。',
      '团队介绍': '我们的团队由AI技术专家、产品设计师和市场营销专家组成，核心成员均拥有相关领域5年以上经验。技术负责人曾参与多个成功的AI产品开发，产品负责人有丰富的SaaS产品设计经验。',
      '发展规划': '短期目标是完善产品功能，提升用户体验；中期目标是扩大市场份额，建立行业影响力；长期目标是打造AI辅助创作领域的领导品牌，并探索更多垂直领域的应用可能。'
    };
    
    return mockContent[sectionTitle] || '内容正在生成中...';
  };

  const handleTextSelection = () => {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection.toString().length > 0) {
        setSelectedText(selection.toString());
      } else {
        setSelectedText('');
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('keyup', handleTextSelection);
    
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('keyup', handleTextSelection);
    };
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>AI Flow Editor</title>
        <meta name="description" content="AI-powered document flow editor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>AI Flow Editor</h1>
        
        <div className={styles.editorContainer}>
          <Editor 
            ref={editorRef}
            isGenerating={isGenerating}
            isPaused={isPaused}
          />
          
          <div className={styles.controls}>
            <button 
              onClick={handleStartGeneration} 
              disabled={isGenerating && !isPaused}
              className={styles.button}
            >
              开始生成
            </button>
            <button 
              onClick={handlePauseGeneration} 
              disabled={!isGenerating || isPaused}
              className={styles.button}
            >
              暂停生成
            </button>
            <button 
              onClick={handleContinueGeneration} 
              disabled={!isPaused}
              className={styles.button}
            >
              继续生成
            </button>
          </div>
        </div>
        
        <AISidebar 
          selectedText={selectedText}
          isGenerating={isGenerating}
        />
      </main>
    </div>
  );
}
