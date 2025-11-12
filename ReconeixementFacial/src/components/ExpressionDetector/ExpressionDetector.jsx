// src/components/ExpressionDetector/ExpressionDetector.jsx
import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import './ExpressionDetector.css';

const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;

const expressionTranslations = {
  neutral: 'Neutral',
  happy: 'Feliç 😊',
  sad: 'Trist 😢',
  angry: 'Enfadat 😠',
  fearful: 'Espantat 😨',
  disgusted: 'Disgustat 🤢',
  surprised: 'Sorprès 😮',
};

const ExpressionDetector = ({ onExpressionChange }) => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectedExpression, setDetectedExpression] = useState('Detectant...');
  
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null); 

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models'; //
      console.log('Carregant models...');
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        console.log('Models carregats correctament.');
      } catch (error) {
        console.error('Error carregant els models:', error);
      }
    };
    loadModels();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);


  const startDetection = () => {
    console.log('Iniciant detecció...');
    
    intervalRef.current = setInterval(async () => {
      if (webcamRef.current && webcamRef.current.video && canvasRef.current && modelsLoaded) {
        
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        const displaySize = { width: VIDEO_WIDTH, height: VIDEO_HEIGHT };
        faceapi.matchDimensions(canvas, displaySize);
        
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (detections.length > 0) {
          const expressions = detections[0].expressions;
          
          const dominantExpression = Object.keys(expressions).reduce((a, b) =>
            expressions[a] > expressions[b] ? a : b
          );

          setDetectedExpression(expressionTranslations[dominantExpression] || dominantExpression);
          
          if (onExpressionChange) {
            onExpressionChange(dominantExpression);
          }

          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

        } else {
          setDetectedExpression('Sense rostre detectat');
          
          if (onExpressionChange) {
            onExpressionChange('default');
          }
        }
      }
    }, 500);
  };

  const handleVideoOnPlay = () => {
    startDetection();
  };

  return (
    <div className="detector-container">
      <h2>Detector d'Estat d'Ànim (RA2)</h2>
      {!modelsLoaded ? (
        <p className="loading-message">Carregant models d'IA, si us plau, espereu...</p>
      ) : (
        <p className="loading-message">Models Carregats!</p>
      )}
      
      <div className="video-container">
        <Webcam
          ref={webcamRef}
          audio={false}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
          videoConstraints={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT, facingMode: 'user' }}
          onUserMedia={handleVideoOnPlay}
          className="webcam" 
        />
        <canvas
          ref={canvasRef}
          className="canvas"
        />
      </div>
      
      {modelsLoaded && (
        <h3 className="status-message">
          Estat d'ànim detectat: {detectedExpression}
        </h3>
      )}
    </div>
  );
};

export default ExpressionDetector;