import React, { useState } from 'react';
import './App.css'; 
import SheetMusicTest from './SheetMusicTest';
import Login from './Login';

// frequency (in hertz)
const noteFrequencies = {
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
  'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
  'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25
};

// abc notation translator
const abcMapper = {
  'C4': 'C', 'C#4': '^C', 'D4': 'D', 'D#4': '^D',
  'E4': 'E', 'F4': 'F', 'F#4': '^F', 'G4': 'G',
  'G#4': '^G', 'A4': 'A', 'A#4': '^A', 'B4': 'B',
  'C5': 'c'
};

// synthesizer
const playSynthNote = (noteName) => {
  const frequency = noteFrequencies[noteName];
  if (!frequency) return;

  // initialize the browser's audio engine
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  // create an oscillator 
  const oscillator = audioCtx.createOscillator();
  oscillator.type = 'triangle'; 
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeNote, setActiveNote] = useState('None');
  const [melodyString, setMelodyString] = useState("");

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
    setMelodyString((prev) => {
      // count how many actual notes we have 
      const currentNotes = prev.split(' ').filter(n => n !== '' && n !== '|' && n !== '\n');
      const noteCount = currentNotes.length;

      let newAddition = abcMapper[note] + " ";

      // add a measure bar every 4 notes
      if ((noteCount + 1) % 4 === 0) {
        newAddition += "| ";
      }

      // force a new staff line below every 16 notes
      if ((noteCount + 1) % 16 === 0) {
        newAddition += "\n"; 
      }

      return prev + newAddition;
    });
  };

  // function to handle undoing the last note
  const handleUndo = () => {
    setMelodyString((prev) => {
      const arr = prev.trim().split(' ');
      if (arr.length === 0 || arr[0] === "") return "";
      
      // if the last thing we added was a measure bar or new line, delete it first
      if (arr[arr.length - 1] === '|' || arr[arr.length - 1] === '\n') {
        arr.pop();
      }
      
      // delete the actual note
      arr.pop(); 
      return arr.length > 0 ? arr.join(' ') + ' ' : '';
    });
  };

  // function to reset the entire composition
  const handleReset = () => {
    setMelodyString("");
    setActiveNote('None');
  };

  // show login page if not authenticated, otherwise show the main app
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
      <div className="app-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '30px'   }}>
          <h1>🎹 HarmoCraft Workspace</h1>
          
          <button 
            onClick={() => setIsAuthenticated(false)} 
            className="secondary-btn"
          >
            Log Out
          </button>
        </div>
        
        <div className="status-panel" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <h3 style={{ margin: 0, marginRight: '10px' }}>
            Last Note: <span className="note-display">{activeNote}</span>
          </h3>
          
          {/* undo button*/}
          <button 
            onClick={handleUndo}
            style={{
              padding: '8px 16px', background: '#e53e3e', color: 'white', 
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            ↩ Undo
          </button>

          {/* reset button*/}
          <button 
            onClick={handleReset}
            style={{
              padding: '8px 16px', background: '#718096', color: 'white', 
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            🗑️ Reset
          </button>
        </div>

        <SheetMusicTest melody={melodyString} />

        
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