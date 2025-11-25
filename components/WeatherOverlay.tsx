
import React from 'react';
import { WeatherType } from '../types';

interface WeatherOverlayProps {
  weather: WeatherType;
}

const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ weather }) => {
  if (weather === 'CLEAR') return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-lg">
      <style>{`
        @keyframes rain-fall {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes fog-drift {
          0% { transform: translateX(-10%); opacity: 0.2; }
          50% { opacity: 0.5; }
          100% { transform: translateX(10%); opacity: 0.2; }
        }
        @keyframes lightning-flash {
          0%, 90%, 100% { opacity: 0; }
          92% { opacity: 0.3; }
          93% { opacity: 0; }
          94% { opacity: 0.1; }
          96% { opacity: 0; }
        }
        @keyframes wind-streak {
           0% { transform: translateX(-100%); opacity: 0; }
           20% { opacity: 0.5; }
           80% { opacity: 0.5; }
           100% { transform: translateX(200%); opacity: 0; }
        }
        
        .weather-particle { position: absolute; }
        
        .rain-drop {
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(200,200,255,0.6));
          width: 1px;
          height: 40px;
          animation: rain-fall linear infinite;
        }
        
        .fog-layer {
            inset: -50%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
            animation: fog-drift 15s ease-in-out infinite alternate;
        }
        
        .storm-flash {
            inset: 0;
            background: #fff;
            mix-blend-mode: overlay;
            animation: lightning-flash 6s infinite;
        }
        
        .wind-line {
            height: 1px;
            background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.4), rgba(255,255,255,0));
            width: 150px;
            animation: wind-streak linear infinite;
        }
      `}</style>

      {/* Rain Effect */}
      {weather === 'RAIN' && (
         <>
           {[...Array(40)].map((_, i) => (
             <div key={`rain-${i}`} className="weather-particle rain-drop" style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDuration: `${0.6 + Math.random() * 0.4}s`,
                animationDelay: `-${Math.random() * 2}s`
             }} />
           ))}
         </>
      )}

      {/* Storm Effect */}
      {weather === 'STORM' && (
          <>
            {[...Array(60)].map((_, i) => (
             <div key={`storm-${i}`} className="weather-particle rain-drop" style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                width: '2px',
                height: '50px',
                animationDuration: `${0.4 + Math.random() * 0.2}s`,
                animationDelay: `-${Math.random() * 2}s`,
                opacity: 0.7
             }} />
           ))}
           <div className="weather-particle storm-flash" />
          </>
      )}

      {/* Fog Effect */}
      {weather === 'FOG' && (
          <>
            <div className="weather-particle fog-layer" style={{ animationDelay: '0s' }} />
            <div className="weather-particle fog-layer" style={{ animationDelay: '-7s', transform: 'scale(1.2)' }} />
          </>
      )}

      {/* Wind Effect */}
       {weather === 'WINDY' && (
          <>
           {[...Array(15)].map((_, i) => (
             <div key={`wind-${i}`} className="weather-particle wind-line" style={{
                top: `${Math.random() * 100}%`,
                left: '-20%',
                animationDuration: `${0.8 + Math.random() * 1}s`,
                animationDelay: `-${Math.random() * 2}s`
             }} />
           ))}
          </>
      )}
    </div>
  );
};

export default WeatherOverlay;
