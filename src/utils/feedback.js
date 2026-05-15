// Initialize Audio Context once
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// Browsers block audio until the user interacts with the page.
// This helper ensures the engine is awake before playing a sound.
const resumeAudio = () => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
};

export const vibrate = (pattern) => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(pattern);
    }
};

export const playDing = () => {
    resumeAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5); // Drop to A4
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
};

export const playPop = () => {
    resumeAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'sine';
    // Drops frequency very fast to create a "thud/pop" sound
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(0.6, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
};

export const playTap = () => {
    resumeAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    
    // Very short decay for a subtle UI tick
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.03);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.03);
};

export const playTriumph = () => {
    resumeAudio();
    // Play a 3-note ascending chord (C major arpeggio)
    const playNote = (freq, startTime, duration) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
    };

    const now = audioCtx.currentTime;
    playNote(523.25, now, 0.4);       // C5
    playNote(659.25, now + 0.15, 0.4); // E5
    playNote(783.99, now + 0.3, 0.8);  // G5
};

export const playAlarm = () => {
    resumeAudio();
    const playBeep = (startTime) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, startTime);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
        
        osc.start(startTime);
        osc.stop(startTime + 0.15);
    };

    const now = audioCtx.currentTime;
    // Play 3 fast sequential beeps
    playBeep(now);
    playBeep(now + 0.2);
    playBeep(now + 0.4);
};