import React, { useState } from 'react';
import './App.css'; 

// frequency (in hertz)
const noteFrequencies = {
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
  'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
  'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25
};

// synthesizer
const playSynthNote = (noteName) => {
  const frequency = noteFrequencies[noteName];
  if (!frequency) return;

  // initialize the browser's audio engine
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  // create an oscillator 
  const oscillator = audioCtx.createOscillator();
  oscillator.type = 'sine'; 
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  // create a gain node (the volume knob)
  const gainNode = audioCtx.createGain();
  
  // start at full volume, then quickly fade out over 1.5 seconds
  gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

  // connect the wires: Oscillator -> Volume -> Speakers
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // play the note and stop
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 1.5);
};

function App() {
  const [activeNote, setActiveNote] = useState('None');

  const whiteKeys = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
  
  const blackKeys = [
    { name: 'C#4', position: 1 },
    { name: 'D#4', position: 2 },
    { name: 'F#4', position: 4 },
    { name: 'G#4', position: 5 },
    { name: 'A#4', position: 6 }
  ];

  // function to handle key clicks
  const handleKeyClick = (note) => {
    setActiveNote(note);
    playSynthNote(note);
  };

  return (
    <div className="app-container">
      <h1>🎹 HarmoCraft Workspace</h1>
      <div className="status-panel">
        <h3>Last Note Played: <span className="note-display">{activeNote}</span></h3>
      </div>

      <div className="staff-container">
        <h3>Musical Staff</h3>
        <div className="mock-staff">
          <div className="staff-line"></div> 
          <div className="staff-line"></div> 
          <div className="staff-line"></div> 
          <div className="staff-line"></div> 
          <div className="staff-line"></div> 
          
{activeNote !== 'None' && (
            <div 
              className="note-wrapper"
              style={{ 
                bottom: 
                  (activeNote === 'C4' || activeNote === 'C#4') ? '-3px' :
                  (activeNote === 'D4' || activeNote === 'D#4') ? '9px' :
                  (activeNote === 'E4')                         ? '21px' :
                  (activeNote === 'F4' || activeNote === 'F#4') ? '33px' :
                  (activeNote === 'G4' || activeNote === 'G#4') ? '45px' :
                  (activeNote === 'A4' || activeNote === 'A#4') ? '57px' :
                  (activeNote === 'B4')                         ? '69px' :
                  (activeNote === 'C5')                         ? '81px' : '21px'
              }}
            >
              {/* conditional sharp sign */}
              {activeNote.includes('#') && <span className="accidental">♯</span>}
              
              {/* custom CSS note */}
              <div className="css-note">
                <div className="css-note-head"></div>
                {/* dynamically assign stem direction class */}
                <div className={`css-stem ${(activeNote === 'B4' || activeNote === 'C5') ? 'stem-down' : 'stem-up'}`}></div>
              </div>

              {/* conditional ledger line for C4 / C#4 */}
              {(activeNote === 'C4' || activeNote === 'C#4') && (
                <div className="ledger-line"></div>
              )}
            </div>
          )}        
        </div>
      </div> 

      {/* piano keyboard container */}
      <div className="piano-container">
        <div className="piano-keyboard">
          
          {/* render white keys */}
          {whiteKeys.map((note) => (
            <button 
              key={note} 
              className="white-key" 
              onClick={() => handleKeyClick(note)}
            >
              <span className="key-label">{note}</span>
            </button>
          ))}

          {/* render black keys overlayed via absolute positions */}
          {blackKeys.map((key) => (
            <button
              key={key.name}
              className="black-key"
              style={{ left: `${key.position * 50 - 15}px` }}
              onClick={() => handleKeyClick(key.name)}
            >
              <span className="key-label black-label">{key.name}</span>
            </button>
          ))}

        </div>
      </div>
    </div> 
  );
}

export default App;