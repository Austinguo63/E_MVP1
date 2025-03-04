import { useState, useEffect } from 'react';
import styles from '../styles/AISidebar.module.css';

const AISidebar = ({ selectedText, isGenerating }) => {
  const [userInput, setUserInput] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Update suggestions when text is selected
  useEffect(() => {
    if (selectedText && selectedText.length > 10) {
      generateSuggestions(selectedText);
    }
  }, [selectedText]);
  
  const generateSuggestions = async (text) => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the API
      // For demonstration, we'll use mock suggestions
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockSuggestions = [
        {
          id: 1,
          type: 'improvement',
          original: text,
          suggestion: text.replace(/很好/g, '卓越').replace(/不错/g, '优质')
        },
        {
          id: 2,
          type: 'expansion',
          suggestion: '您可以在这里添加更多关于市场规模的具体数据，例如引用最新的行业报告。'
        },
        {
          id: 3,
          type: 'citation',
          suggestion: '建议添加数据来源，例如："根据麦肯锡2024年报告..."'
        }
      ];
      
      setAiSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    setAiSuggestions([
      {
        id: Date.now(),
        type: 'user',
        message: userInput
      },
      ...aiSuggestions
    ]);
    
    try {
      // In a real implementation, this would call the API
      // For demonstration, we'll use a mock response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAiSuggestions(prev => [
        {
          id: Date.now() + 1,
          type: 'ai',
          message: `关于"${userInput}"，我建议您考虑以下几点：\n\n1. 添加更多具体数据支持您的观点\n2. 考虑增加一个实际案例来说明\n3. 可以进一步阐述实施细节`
        },
        ...prev
      ]);
      
      setUserInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImproveSelection = async () => {
    if (!selectedText) return;
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the improve API
      const response = await fetch('/api/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: selectedText }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to improve text');
      }
      
      const data = await response.json();
      
      // In a real implementation, you would replace the selected text in the editor
      // For demonstration, we'll just show the improved text in the sidebar
      setAiSuggestions(prev => [
        {
          id: Date.now(),
          type: 'improvement',
          original: selectedText,
          suggestion: data.improved,
          suggestions: data.suggestions
        },
        ...prev
      ]);
    } catch (error) {
      console.error('Error improving text:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegenerateSection = () => {
    // In a real implementation, this would identify the current section and regenerate it
    // For demonstration, we'll just show a message
    setAiSuggestions(prev => [
      {
        id: Date.now(),
        type: 'info',
        message: '已请求重新生成当前部分。在实际实现中，这将重新生成您当前所在的部分。'
      },
      ...prev
    ]);
  };
  
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h3>AI 助手</h3>
      </div>
      
      <div className={styles.suggestions}>
        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>AI思考中...</p>
          </div>
        )}
        
        {aiSuggestions.length === 0 && !isLoading && (
          <div className={styles.emptySuggestions}>
            <p>选择文本以获取AI建议，或在下方输入问题</p>
          </div>
        )}
        
        {aiSuggestions.map(item => (
          <div key={item.id} className={`${styles.suggestionItem} ${styles[item.type]}`}>
            {item.type === 'user' && (
              <div className={styles.userMessage}>
                <strong>您:</strong> {item.message}
              </div>
            )}
            
            {item.type === 'ai' && (
              <div className={styles.aiMessage}>
                <strong>AI:</strong> 
                <div dangerouslySetInnerHTML={{ __html: item.message.replace(/\n/g, '<br/>') }} />
              </div>
            )}
            
            {item.type === 'improvement' && (
              <div className={styles.improvement}>
                <div className={styles.improvementHeader}>改进建议:</div>
                <div className={styles.original}>原文: {item.original}</div>
                <div className={styles.improved}>改进: {item.suggestion}</div>
                {item.suggestions && (
                  <div className={styles.additionalSuggestions}>
                    <div>其他建议:</div>
                    <ul>
                      {item.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <button className={styles.applyButton}>应用此改进</button>
              </div>
            )}
            
            {item.type === 'expansion' && (
              <div className={styles.expansion}>
                <div className={styles.expansionHeader}>扩展建议:</div>
                <div>{item.suggestion}</div>
                <button className={styles.applyButton}>插入此内容</button>
              </div>
            )}
            
            {item.type === 'citation' && (
              <div className={styles.citation}>
                <div className={styles.citationHeader}>引用建议:</div>
                <div>{item.suggestion}</div>
                <button className={styles.applyButton}>添加引用</button>
              </div>
            )}
            
            {item.type === 'info' && (
              <div className={styles.info}>
                <div>{item.message}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className={styles.actions}>
        <button 
          className={styles.actionButton}
          disabled={!selectedText || selectedText.length < 5}
          onClick={handleImproveSelection}
        >
          优化选中内容
        </button>
        <button 
          className={styles.actionButton}
          onClick={handleRegenerateSection}
        >
          重新生成此部分
        </button>
      </div>
      
      <div className={styles.chatInput}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="向AI提问或给出指令..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isGenerating && !selectedText}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!userInput.trim() || (isGenerating && !selectedText)}
        >
          发送
        </button>
      </div>
    </div>
  );
};

export default AISidebar;
