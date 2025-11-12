
import React, { useState } from 'react';
import ExpressionDetector from './components/ExpressionDetector/ExpressionDetector';

const expressionColors = {
  neutral: '#f0f0f0',    
  happy: '#e6ffcc',      
  sad: '#cce6ff',        
  angry: '#ffcccc',      
  fearful: '#fff0b3',    
  disgusted: '#d9b38c',   
  surprised: '#e6ccff',   
  default: '#f0f0f0'     
};

function App() {
  const [currentExpression, setCurrentExpression] = useState('default');

  const handleExpressionChange = (expression) => {
    setCurrentExpression(expression);
  };

  const backgroundColor = expressionColors[currentExpression] || expressionColors.default;

  document.body.style.backgroundColor = backgroundColor;

  return (
    <div className="App">
      <ExpressionDetector onExpressionChange={handleExpressionChange} />
    </div>
  );
}

export default App;
