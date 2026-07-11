/*
  ███████╗██╗   ██╗██╗
  ██╔════╝██║   ██║██║
  █████╗  ██║   ██║██║
  ██╔══╝  ╚██╗ ██╔╝██║
  ███████╗ ╚████╔╝ ███████╗
  ╚══════╝  ╚═══╝  ╚══════╝
  [ EVL Watermark - Integrity Verified ]
*/
/**
 * Let There Be Light - Thought, Frequency, & Matter
 * Core Application Logic & Physics Engine
 */

// --- STATE MANAGEMENT ---
const state = {
    // Audio Context & Nodes
    audioCtx: null,
    oscillator1: null,
    oscillator2: null,
    gainNode: null,
    analyser: null,
    micStream: null,
    micSource: null,
    isPlaying: false,
    inputSource: 'generator', // 'generator' or 'mic'
    
    // Core Physics Parameters (Chladni Plate)
    frequency: 528,
    nodeN: 4,      // Horizontal modal factor
    nodeM: 5,      // Vertical modal factor
    targetN: 4,    // Interpolation target
    targetM: 5,    // Interpolation target
    excitation: 4.0, // Shaking force
    volume: 0.2,   // Oscillator volume (0.0 to 1.0)
    
    // Thought Intent Settings
    intent: 'focus', // 'focus', 'calm', 'manifest', 'transcend'
    thoughtText: '',
    thoughtAlignment: 0, // 0 to 100
    
    // Canvas & Particles
    particles: [],
    particleCount: 2500,
    width: 0,
    height: 0,
    mouse: { x: null, y: null, px: null, py: null, active: false, radius: 80 },
    
    // Stats & Feedback
    coherence: 85,
    entropy: 25,
    vocalFreq: 0,
    vocalNote: '--',
    vocalAligned: false,
    vocalAlignedLabel: '',
    
    // Genesis Creation States
    genesisActive: false,
    genesisTimer: 0,
    genesisFlash: 0,
    
    // Web3 State
    web3Provider: null,
    web3Signer: null,
    walletConnected: false,
    userAddress: '',
    resolvedName: 'sophiaserpent.base.eth' // Basename representation
};

// Intent Settings Config
const intentConfig = {
    focus: {
        color1: '#00f2fe',
        color2: '#4facfe',
        friction: 0.94,
        speed: 1.0,
        noiseScale: 0.2,
        particleSize: 1.5,
        trail: 0.15,
        ambientGlow: 'rgba(0, 242, 254, 0.25)'
    },
    calm: {
        color1: '#05ffa1',
        color2: '#00f2fe',
        friction: 0.88,
        speed: 0.4,
        noiseScale: 0.1,
        particleSize: 2.0,
        trail: 0.25,
        ambientGlow: 'rgba(5, 255, 161, 0.2)'
    },
    manifest: {
        color1: '#ff007f',
        color2: '#ffd166',
        friction: 0.96,
        speed: 1.8,
        noiseScale: 0.5,
        particleSize: 1.8,
        trail: 0.08,
        ambientGlow: 'rgba(255, 0, 127, 0.3)'
    },
    transcend: {
        color1: '#7f00ff',
        color2: '#ff007f',
        friction: 0.95,
        speed: 1.2,
        noiseScale: 0.3,
        particleSize: 1.2,
        trail: 0.12,
        ambientGlow: 'rgba(127, 0, 255, 0.3)'
    }
};

// --- DOM ELEMENTS ---
const el = {
    welcomeOverlay: document.getElementById('welcome-overlay'),
    btnStartOverlay: document.getElementById('btn-start-overlay'),
    btnActivate: document.getElementById('btn-activate'),
    statusDot: document.getElementById('status-dot'),
    statusText: document.getElementById('status-text'),
    
    // Inputs & Sliders
    btnSrcGenerator: document.getElementById('btn-src-generator'),
    btnSrcMic: document.getElementById('btn-src-mic'),
    generatorControls: document.getElementById('generator-controls'),
    micControls: document.getElementById('mic-controls'),
    solfeggioBtns: document.querySelectorAll('.solfeggio-btn'),
    inputVolume: document.getElementById('input-volume'),
    valVolume: document.getElementById('val-volume'),
    btnAuthMic: document.getElementById('btn-auth-mic'),
    micRing: document.getElementById('mic-ring'),
    
    // Tuning Accordion
    tuningToggle: document.getElementById('tuning-toggle'),
    tuningContent: document.getElementById('tuning-content'),
    inputNodeN: document.getElementById('input-node-n'),
    valNodeN: document.getElementById('val-node-n'),
    inputNodeM: document.getElementById('input-node-m'),
    valNodeM: document.getElementById('val-node-m'),
    inputExcitation: document.getElementById('input-excitation'),
    valExcitation: document.getElementById('val-excitation'),
    
    // Intention Buttons
    intentBtns: document.querySelectorAll('.intent-btn'),
    thoughtInput: document.getElementById('thought-manifesto'),
    
    // Canvases
    matrixCanvas: document.getElementById('matrix-canvas'),
    waveCanvas: document.getElementById('wave-canvas'),
    
    // Stats & UI Labels
    matrixCoord: document.getElementById('matrix-coord'),
    geometryLabel: document.getElementById('geometry-label'),
    statParticles: document.getElementById('stat-particles'),
    statCarrier: document.getElementById('stat-carrier'),
    statCoherence: document.getElementById('stat-coherence'),
    
    // Bars
    barEntropy: document.getElementById('bar-entropy'),
    barCoherence: document.getElementById('bar-coherence'),
    barThought: document.getElementById('bar-thought'),
    
    // Ambient Glow Blobs
    glow1: document.getElementById('glow-1'),
    glow2: document.getElementById('glow-2'),
    
    // Vocal Resonance UI Elements
    vocalTracker: document.getElementById('vocal-tracker'),
    vocalFreqReadout: document.getElementById('vocal-freq'),
    vocalNoteReadout: document.getElementById('vocal-note'),
    vocalResonance: document.getElementById('vocal-resonance'),
    vocalResonanceStatus: document.getElementById('vocal-resonance-status'),
    pitchNeedle: document.getElementById('pitch-needle'),
    
    // Genesis creation
    btnGenesis: document.getElementById('btn-genesis'),
    
    // LIGHT Token elements
    tokenBalance: document.getElementById('token-balance'),
    btnClaimFaucet: document.getElementById('btn-claim-faucet'),
    btnAddToken: document.getElementById('btn-add-token'),
    chkDustShield: document.getElementById('chk-dust-shield')
};

// --- INITIALIZATION ---
function init() {
    setupCanvas();
    createParticles();
    bindEvents();
    updateUIColors();
    
    // Start canvas animation loop
    requestAnimationFrame(tick);
}

// --- CANVAS SETUP ---
function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    
    // Matrix Canvas (Cymatics Grid)
    const mRect = el.matrixCanvas.parentElement.getBoundingClientRect();
    state.width = mRect.width;
    state.height = mRect.height;
    
    el.matrixCanvas.width = state.width * dpr;
    el.matrixCanvas.height = state.height * dpr;
    el.matrixCanvas.style.width = `${state.width}px`;
    el.matrixCanvas.style.height = `${state.height}px`;
    
    const mCtx = el.matrixCanvas.getContext('2d');
    mCtx.scale(dpr, dpr);
    
    // Wave Canvas (Audio overlay)
    const wRect = el.waveCanvas.parentElement.getBoundingClientRect();
    el.waveCanvas.width = wRect.width * dpr;
    el.waveCanvas.height = wRect.height * dpr;
    el.waveCanvas.style.width = `${wRect.width}px`;
    el.waveCanvas.style.height = `${wRect.height}px`;
    
    const wCtx = el.waveCanvas.getContext('2d');
    wCtx.scale(dpr, dpr);
}

// --- PARTICLE PHYSICS ENGINE ---
class Particle {
    constructor() {
        this.reset();
    }
    
    reset() {
        // Positions are stored in normalized coordinate space [-1, 1]
        this.x = (Math.random() - 0.5) * 2;
        this.y = (Math.random() - 0.5) * 2;
        this.vx = 0;
        this.vy = 0;
        this.charge = Math.random(); // custom phase offset for individual animations
    }
    
    update(n, m, config, excitation, audioAmplitude = 0) {
        // Calculate current modal factors
        const piX = Math.PI * (this.x + 1) / 2;
        const piY = Math.PI * (this.y + 1) / 2;
        
        // Chladni plate equation
        // z = cos(n * pi * x) * cos(m * pi * y) - cos(m * pi * x) * cos(n * pi * y)
        const cosNX = Math.cos(n * piX);
        const cosMY = Math.cos(m * piY);
        const cosMX = Math.cos(m * piX);
        const cosNY = Math.cos(n * piY);
        
        const z = cosNX * cosMY - cosMX * cosNY;
        const absZ = Math.abs(z);
        
        // Numerical gradient evaluation
        // Find path to lower vibration nodes (where z = 0)
        const step = 0.015;
        
        // Horizontal shift
        const nextX = this.x + step;
        const zX = Math.cos(n * (Math.PI * (nextX + 1) / 2)) * Math.cos(m * piY) - 
                   Math.cos(m * (Math.PI * (nextX + 1) / 2)) * Math.cos(n * piY);
        const gradX = (Math.abs(zX) - absZ) / step;
        
        // Vertical shift
        const nextY = this.y + step;
        const zY = Math.cos(n * piX) * Math.cos(m * (Math.PI * (nextY + 1) / 2)) - 
                   Math.cos(m * piX) * Math.cos(n * (Math.PI * (nextY + 1) / 2));
        const gradY = (Math.abs(zY) - absZ) / step;
        
        // Physics variables based on intention state
        const speedMultiplier = config.speed;
        const noiseFactor = config.noiseScale * (excitation + audioAmplitude * 5);
        
        // Particles move in the direction of negative gradient (towards the quiet nodal lines)
        // Add random agitation proportional to local plate displacement (vibrational thermal noise)
        const force = 0.035 * speedMultiplier;
        
        this.vx -= gradX * force;
        this.vy -= gradY * force;
        
        // Shaking noise
        this.vx += (Math.random() - 0.5) * absZ * noiseFactor;
        this.vy += (Math.random() - 0.5) * absZ * noiseFactor;
        
        // Genesis outward push (Big Bang simulation)
        if (state.genesisActive && state.genesisTimer > 0) {
            const pushForce = state.genesisTimer * 0.15;
            const angle = Math.atan2(this.y, this.x) || Math.random() * Math.PI * 2;
            this.vx += Math.cos(angle) * pushForce;
            this.vy += Math.sin(angle) * pushForce;
        }
        
        // Apply friction
        this.vx *= config.friction;
        this.vy *= config.friction;
        
        // Move particle
        this.x += this.vx;
        this.y += this.vy;
        
        // Interact with Mouse (Consciousness disturbance)
        if (state.mouse.active && state.mouse.x !== null) {
            // Map mouse back to [-1, 1] range
            const mouseX = (state.mouse.x / state.width) * 2 - 1;
            const mouseY = (state.mouse.y / state.height) * 2 - 1;
            
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Interaction distance
            const interactionRadius = state.mouse.radius / (state.width / 2);
            
            if (dist < interactionRadius) {
                const forceMag = (1 - dist / interactionRadius) * 0.08;
                
                // Intention decides attraction/repulsion: Focus pulls in, Manifest pushes, Calm repels gently, Transcend warps
                if (state.intent === 'focus') {
                    // Attract to mouse
                    this.vx -= (dx / dist) * forceMag * 0.6;
                    this.vy -= (dy / dist) * forceMag * 0.6;
                } else if (state.intent === 'manifest') {
                    // Strong push (repulsion)
                    this.vx += (dx / dist) * forceMag * 1.5;
                    this.vy += (dy / dist) * forceMag * 1.5;
                } else if (state.intent === 'calm') {
                    // Swirl orbit
                    this.vx += (dy / dist) * forceMag * 0.5;
                    this.vy -= (dx / dist) * forceMag * 0.5;
                } else if (state.intent === 'transcend') {
                    // Warp teleportation
                    if (Math.random() < 0.05) {
                        this.x = mouseX + (Math.random() - 0.5) * interactionRadius;
                        this.y = mouseY + (Math.random() - 0.5) * interactionRadius;
                    }
                }
            }
        }
        
        // Boundaries handling
        if (this.x < -1 || this.x > 1 || this.y < -1 || this.y > 1) {
            if (state.intent === 'transcend') {
                // Toroidal wrap-around
                this.x = this.x < -1 ? 1 : (this.x > 1 ? -1 : this.x);
                this.y = this.y < -1 ? 1 : (this.y > 1 ? -1 : this.y);
            } else {
                this.reset();
            }
        }
    }
    
    draw(ctx, w, h, config) {
        // Map back to canvas coordinates
        const cx = ((this.x + 1) / 2) * w;
        const cy = ((this.y + 1) / 2) * h;
        
        // Shift color dynamically based on velocity & charge phase
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const lerpVal = Math.min(1, speed * 20);
        
        let baseColor = interpolateColor(config.color1, config.color2, lerpVal);
        if (state.vocalAligned) {
            baseColor = interpolateColor(baseColor, '#05ffa1', 0.6); // shift color towards alignment green/teal
        }
        ctx.fillStyle = baseColor;
        
        // Render particle
        ctx.beginPath();
        let size = config.particleSize * (1 + state.thoughtAlignment / 100);
        if (state.vocalAligned) {
            size *= 1.8; // swell particles during vocal resonance alignment
        }
        ctx.arc(cx, cy, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Focus/Coherence connectors
        if (state.intent === 'focus' && state.thoughtAlignment > 30) {
            // Draw faint lines between very close particles to show "networking thoughts"
            // (Only for a few indices to preserve performance)
            if (this.charge < 0.04) {
                ctx.strokeStyle = `rgba(0, 242, 254, ${0.1 * (state.thoughtAlignment / 100)})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                // Look at next particle
                const nextP = state.particles[Math.floor(this.charge * 10000) % state.particleCount];
                const ncx = ((nextP.x + 1) / 2) * w;
                const ncy = ((nextP.y + 1) / 2) * h;
                const distSq = (cx - ncx) * (cx - ncx) + (cy - ncy) * (cy - ncy);
                if (distSq < 1600) {
                    ctx.lineTo(ncx, ncy);
                    ctx.stroke();
                }
            }
        }
    }
}

function createParticles() {
    state.particles = [];
    for (let i = 0; i < state.particleCount; i++) {
        state.particles.push(new Particle());
    }
    el.statParticles.innerText = state.particleCount.toLocaleString();
}

// --- AUDIO CONTROLLER ENGINE ---
function initAudio() {
    if (state.audioCtx) return;
    
    // Create Audio Context
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    state.audioCtx = new AudioContextClass();
    
    // Analyser Node
    state.analyser = state.audioCtx.createAnalyser();
    state.analyser.fftSize = 1024;
    
    // Gain (Volume) Node
    state.gainNode = state.audioCtx.createGain();
    state.gainNode.gain.setValueAtTime(state.volume, state.audioCtx.currentTime);
    
    // Connect Gain -> Analyser -> Output
    state.gainNode.connect(state.analyser);
    state.analyser.connect(state.audioCtx.destination);
    
    // Initialize Oscillators for generator mode
    setupOscillators();
}

function setupOscillators() {
    if (!state.audioCtx || state.inputSource !== 'generator') return;
    
    stopOscillators();
    
    // Carrier wave (pure solfeggio frequency)
    state.oscillator1 = state.audioCtx.createOscillator();
    state.oscillator1.type = 'sine';
    state.oscillator1.frequency.setValueAtTime(state.frequency, state.audioCtx.currentTime);
    
    // Binaural offset wave (detuned +1Hz for neural entrainment)
    state.oscillator2 = state.audioCtx.createOscillator();
    state.oscillator2.type = 'sine';
    state.oscillator2.frequency.setValueAtTime(state.frequency + 1.2, state.audioCtx.currentTime);
    
    // Connect oscillators to gain
    state.oscillator1.connect(state.gainNode);
    state.oscillator2.connect(state.gainNode);
    
    if (state.isPlaying) {
        state.oscillator1.start();
        state.oscillator2.start();
    }
}

function stopOscillators() {
    if (state.oscillator1) {
        try { state.oscillator1.stop(); } catch(e) {}
        state.oscillator1.disconnect();
        state.oscillator1 = null;
    }
    if (state.oscillator2) {
        try { state.oscillator2.stop(); } catch(e) {}
        state.oscillator2.disconnect();
        state.oscillator2 = null;
    }
}

function toggleMatrixPower() {
    initAudio();
    
    if (state.audioCtx.state === 'suspended') {
        state.audioCtx.resume();
    }
    
    state.isPlaying = !state.isPlaying;
    
    if (state.isPlaying) {
        el.btnActivate.classList.add('active');
        el.btnActivate.querySelector('.activate-text').innerText = "DISCONNECT THE GRID";
        
        el.statusDot.className = "pulse-dot active";
        el.statusText.innerText = "MATRIX RESONANCE ENGAGED";
        
        if (state.inputSource === 'generator') {
            setupOscillators();
        } else {
            startMicCapture();
        }
    } else {
        el.btnActivate.classList.remove('active');
        el.btnActivate.querySelector('.activate-text').innerText = "TAP INTO THE MATRIX";
        
        el.statusDot.className = "pulse-dot idle";
        el.statusText.innerText = "SYSTEM INERT";
        
        stopOscillators();
        stopMicCapture();
    }
}

// --- MICROPHONE INPUT MANAGER ---
async function startMicCapture() {
    if (!state.audioCtx) return;
    
    stopOscillators();
    stopMicCapture();
    
    try {
        state.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        state.micSource = state.audioCtx.createMediaStreamSource(state.micStream);
        
        // Connect mic -> gain node (keeps volume slider useful)
        state.micSource.connect(state.gainNode);
        
        el.micRing.classList.add('recording');
        el.vocalTracker.classList.remove('hidden');
        el.statusDot.className = "pulse-dot active";
        el.statusText.innerText = "CAPTURING ENVIRONMENTAL FIELD";
    } catch (err) {
        console.error("Microphone access denied:", err);
        el.statusDot.className = "pulse-dot warning";
        el.statusText.innerText = "MICROPHONE DENIED";
        // Fallback to generator
        setSource('generator');
    }
}

function stopMicCapture() {
    if (state.micStream) {
        state.micStream.getTracks().forEach(track => track.stop());
        state.micStream = null;
    }
    if (state.micSource) {
        state.micSource.disconnect();
        state.micSource = null;
    }
    el.micRing.classList.remove('recording');
    el.vocalTracker.classList.add('hidden');
}

function setSource(source) {
    if (state.inputSource === source) return;
    state.inputSource = source;
    
    if (source === 'generator') {
        el.btnSrcGenerator.classList.add('active');
        el.btnSrcMic.classList.remove('active');
        el.generatorControls.classList.remove('hidden');
        el.micControls.classList.add('hidden');
        
        stopMicCapture();
        if (state.isPlaying) {
            setupOscillators();
            el.statusText.innerText = "MATRIX RESONANCE ENGAGED";
        }
    } else {
        el.btnSrcMic.classList.add('active');
        el.btnSrcGenerator.classList.remove('active');
        el.micControls.classList.remove('hidden');
        el.generatorControls.classList.add('hidden');
        
        stopOscillators();
        if (state.isPlaying) {
            startMicCapture();
        }
    }
}

// --- INTERACTIVE UI BINDINGS ---
function bindEvents() {
    // Overlay Trigger
    el.btnStartOverlay.addEventListener('click', () => {
        initAudio();
        el.welcomeOverlay.classList.add('hidden');
        toggleMatrixPower();
    });
    
    // Main Power Button
    el.btnActivate.addEventListener('click', () => {
        toggleMatrixPower();
    });
    
    // Genesis Trigger
    el.btnGenesis.addEventListener('click', () => {
        triggerGenesisSequence();
    });
    
    // Toggle Inputs
    el.btnSrcGenerator.addEventListener('click', () => setSource('generator'));
    el.btnSrcMic.addEventListener('click', () => setSource('mic'));
    
    // Solfeggio Buttons
    el.solfeggioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            el.solfeggioBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const freq = parseFloat(btn.getAttribute('data-freq'));
            const n = parseInt(btn.getAttribute('data-n'));
            const m = parseInt(btn.getAttribute('data-m'));
            
            state.frequency = freq;
            state.targetN = n;
            state.targetM = m;
            
            // Sync values to sliders
            el.inputNodeN.value = n;
            el.valNodeN.innerText = n;
            el.inputNodeM.value = m;
            el.valNodeM.innerText = m;
            
            el.statCarrier.innerText = `${freq} Hz`;
            el.geometryLabel.innerText = `Chladni Mode: ${n}, ${m}`;
            
            if (state.isPlaying && state.inputSource === 'generator') {
                setupOscillators();
            }
        });
    });
    
    // Volume Control
    el.inputVolume.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.volume = val / 100;
        el.valVolume.innerText = `${val}%`;
        
        if (state.gainNode && state.audioCtx) {
            state.gainNode.gain.setValueAtTime(state.volume, state.audioCtx.currentTime);
        }
    });
    
    // Mic Authorization
    el.btnAuthMic.addEventListener('click', () => {
        initAudio();
        if (state.audioCtx.state === 'suspended') {
            state.audioCtx.resume();
        }
        if (!state.isPlaying) {
            toggleMatrixPower();
        } else {
            startMicCapture();
        }
    });
    
    // Accordion Toggle
    el.tuningToggle.addEventListener('click', () => {
        el.tuningToggle.classList.toggle('open');
        el.tuningContent.classList.toggle('hidden');
    });
    
    // Advanced Math Sliders
    el.inputNodeN.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.targetN = val;
        el.valNodeN.innerText = val;
        el.geometryLabel.innerText = `Chladni Mode: ${val}, ${state.targetM}`;
    });
    el.inputNodeM.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.targetM = val;
        el.valNodeM.innerText = val;
        el.geometryLabel.innerText = `Chladni Mode: ${state.targetN}, ${val}`;
    });
    el.inputExcitation.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.excitation = val;
        el.valExcitation.innerText = val.toFixed(1);
    });
    
    // Intention Buttons
    el.intentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            el.intentBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            state.intent = btn.getAttribute('data-intent');
            updateUIColors();
        });
    });
    
    // Thought Manifesto Typing Field
    el.thoughtInput.addEventListener('input', (e) => {
        state.thoughtText = e.target.value;
        const textLen = state.thoughtText.length;
        
        // Math calculation of thought alignment
        // Every keystroke generates brief energy spikes in simulation
        state.thoughtAlignment = Math.min(100, textLen * 4);
        
        // Scan for keywords
        const lowerText = state.thoughtText.toLowerCase();
        let bonus = 0;
        const keywords = ['light', 'focus', 'frequency', 'matter', 'peace', 'energy', 'manifest', 'love', 'source', 'matrix', 'tesla', 'cohere'];
        keywords.forEach(word => {
            if (lowerText.includes(word)) {
                bonus += 15;
            }
        });
        
        state.thoughtAlignment = Math.min(100, state.thoughtAlignment + bonus);
        el.barThought.style.width = `${state.thoughtAlignment}%`;
        
        // Temporary displacement excitation spike representing "intent impact"
        const originalExcitation = parseFloat(el.inputExcitation.value);
        state.excitation = originalExcitation + (state.thoughtAlignment / 20);
        setTimeout(() => {
            state.excitation = originalExcitation;
        }, 150);
        
        if (lowerText.trim() === 'let there be light') {
            triggerGenesisSequence();
        }
    });
    
    // Canvas Mouse Interaction
    const getMousePos = (e) => {
        const rect = el.matrixCanvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };
    
    el.matrixCanvas.addEventListener('mousedown', (e) => {
        state.mouse.active = true;
        const pos = getMousePos(e);
        state.mouse.x = pos.x;
        state.mouse.y = pos.y;
    });
    
    el.matrixCanvas.addEventListener('mousemove', (e) => {
        const pos = getMousePos(e);
        state.mouse.px = state.mouse.x;
        state.mouse.py = state.mouse.y;
        state.mouse.x = pos.x;
        state.mouse.y = pos.y;
        
        // Update coordinates label
        const normX = ((pos.x / state.width) * 2 - 1).toFixed(2);
        const normY = ((pos.y / state.height) * 2 - 1).toFixed(2);
        el.matrixCoord.innerText = `X: ${normX} | Y: ${normY}`;
    });
    
    window.addEventListener('mouseup', () => {
        state.mouse.active = false;
    });
    
    el.matrixCanvas.addEventListener('mouseenter', () => {
        state.mouse.active = true;
    });
    el.matrixCanvas.addEventListener('mouseleave', () => {
        state.mouse.active = false;
        state.mouse.x = null;
        state.mouse.y = null;
        el.matrixCoord.innerText = `X: 0.00 | Y: 0.00`;
    });
    
    // Touch support for tablets/mobiles
    el.matrixCanvas.addEventListener('touchstart', (e) => {
        state.mouse.active = true;
        const touch = e.touches[0];
        const pos = getMousePos(touch);
        state.mouse.x = pos.x;
        state.mouse.y = pos.y;
    });
    el.matrixCanvas.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const pos = getMousePos(touch);
        state.mouse.x = pos.x;
        state.mouse.y = pos.y;
    });
    el.matrixCanvas.addEventListener('touchend', () => {
        state.mouse.active = false;
        state.mouse.x = null;
        state.mouse.y = null;
    });
    
    // Insights Tab Buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const targetTab = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-content-panel').forEach(panel => {
                panel.classList.add('hidden');
                panel.classList.remove('active');
            });
            
            const activePanel = document.getElementById(`tab-${targetTab}`);
            activePanel.classList.remove('hidden');
            activePanel.classList.add('active');
        });
    });
    
    // Window Resize handling
    window.addEventListener('resize', () => {
        setupCanvas();
    });
    
    // Web3 Event Listeners
    el.btnConnectWallet.addEventListener('click', () => {
        connectWallet();
    });
    
    el.btnMintResonance.addEventListener('click', () => {
        mintResonanceNFT();
    });

    // LIGHT Token Event Listeners
    el.btnClaimFaucet.addEventListener('click', () => {
        claimFaucetToken();
    });
    el.btnAddToken.addEventListener('click', () => {
        importTokenToWallet();
    });
    el.chkDustShield.addEventListener('change', async (e) => {
        await toggleDustShield(e.target.checked);
    });
}

// --- DYNAMIC STYLING SYSTEM ---
function updateUIColors() {
    const config = intentConfig[state.intent];
    
    // Update CSS variables for root to smoothly transition colors
    document.documentElement.style.setProperty('--theme-primary', config.color1);
    document.documentElement.style.setProperty('--theme-secondary', config.color2);
    document.documentElement.style.setProperty('--theme-glow', config.ambientGlow);
    
    // Glows repositioning
    el.glow1.style.background = `radial-gradient(circle, ${config.color1} 0%, transparent 70%)`;
    el.glow2.style.background = `radial-gradient(circle, ${config.color2} 0%, transparent 70%)`;
    
    // Check if system active
    if (state.isPlaying) {
        el.statusDot.className = "pulse-dot active";
    }
    
    // Update Web3 Mint button text dynamically with Tesla-aligned tiers (3, 6, 9)
    if (el.btnMintResonance) {
        const feeLabel = state.intent === "manifest" ? "0.002 ETH (~$6)"
                       : state.intent === "transcend" ? "0.003 ETH (~$9)"
                       : "0.001 ETH (~$3)";
        
        // Only update if not currently mining/loading
        if (!el.btnMintResonance.disabled) {
            el.btnMintResonance.innerText = `MINT RESONANCE NFT (${feeLabel})`;
        }
    }
}

// --- MATHEMATICAL TICK & RENDERING ---
function tick() {
    // 1. Smoothly interpolate Chladni N & M parameters to prevent geometric snaps
    const interpolationSpeed = 0.05;
    state.nodeN += (state.targetN - state.nodeN) * interpolationSpeed;
    state.nodeM += (state.targetM - state.nodeM) * interpolationSpeed;
    
    // Genesis timers decay
    if (state.genesisActive) {
        state.genesisTimer -= 0.008; // takes ~2.5s
        state.genesisFlash -= 0.015; // takes ~1.1s
        if (state.genesisTimer <= 0) {
            state.genesisActive = false;
        }
    }
    
    // 2. Fetch Audio data
    let audioAmplitude = 0;
    let frequencyArray = new Uint8Array(0);
    
    if (state.isPlaying && state.analyser) {
        // Frequency domain data (For microphone pitch tracking & spectrum analysis)
        frequencyArray = new Uint8Array(state.analyser.frequencyBinCount);
        state.analyser.getByteFrequencyData(frequencyArray);
        
        // Time domain data (For wave overlay draw and amplitude)
        const timeArray = new Uint8Array(state.analyser.fftSize);
        state.analyser.getByteTimeDomainData(timeArray);
        
        // Calculate average amplitude (RMS)
        let sum = 0;
        for (let i = 0; i < timeArray.length; i++) {
            const val = (timeArray[i] - 128) / 128; // scale to [-1, 1]
            sum += val * val;
        }
        audioAmplitude = Math.sqrt(sum / timeArray.length);
        
        // Mic dominant frequency processing (Pitch tracking)
        if (state.inputSource === 'mic' && timeArray.length > 0) {
            analyzeMicrophonePitch(timeArray, frequencyArray);
        }
    }
    
    // 3. Update physics and render Cymatics canvas
    drawCymatics(audioAmplitude);
    
    // 4. Draw wave overlay
    drawWaveOverlay(frequencyArray);
    
    // 5. Update stats bars
    updateStatsBars(audioAmplitude);
    
    // Loop
    requestAnimationFrame(tick);
}

// Pitch tracker notes list
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SOLFEGGIO_TARGETS = [
    { freq: 396, label: "Liberation (396 Hz)" },
    { freq: 417, label: "Facilitate Change (417 Hz)" },
    { freq: 528, label: "Transformation (528 Hz)" },
    { freq: 639, label: "Connection (639 Hz)" },
    { freq: 741, label: "Intuition (741 Hz)" },
    { freq: 852, label: "Spiritual Order (852 Hz)" },
    { freq: 963, label: "Divine Consciousness (963 Hz)" }
];

function analyzeMicrophonePitch(timeArray, freqArray) {
    if (!state.audioCtx) return;
    
    // 1. Run autocorrelation on the time domain buffer for precise fundamental frequency
    const sampleRate = state.audioCtx.sampleRate;
    const domFreq = autoCorrelate(timeArray, sampleRate);
    
    // Check if we got a valid pitch in voice range (e.g. 50Hz to 1200Hz)
    if (domFreq !== -1 && domFreq >= 50 && domFreq <= 1200) {
        state.vocalFreq = domFreq;
        
        // 2. Map frequency to musical note name and cent deviation
        const noteNum = 12 * (Math.log(domFreq / 440) / Math.log(2)) + 69;
        const nearestNoteNum = Math.round(noteNum);
        const cents = Math.round((noteNum - nearestNoteNum) * 100);
        
        const noteIndex = (nearestNoteNum % 12 + 12) % 12;
        const octave = Math.floor(nearestNoteNum / 12) - 1;
        state.vocalNote = NOTE_NAMES[noteIndex] + octave;
        
        // Update needle position
        const needlePos = Math.max(0, Math.min(100, 50 + cents));
        el.pitchNeedle.style.left = `${needlePos}%`;
        
        // 3. Check alignment with Solfeggio resonances
        let aligned = false;
        let alignedLabel = "";
        const tolerance = 4.5; // +/- 4.5Hz window
        
        for (const solfeggio of SOLFEGGIO_TARGETS) {
            if (Math.abs(domFreq - solfeggio.freq) <= tolerance) {
                aligned = true;
                alignedLabel = solfeggio.label;
                break;
            }
        }
        
        state.vocalAligned = aligned;
        state.vocalAlignedLabel = alignedLabel;
        
        // 4. Update the tracker display
        el.vocalFreqReadout.innerText = domFreq.toFixed(1);
        el.vocalNoteReadout.innerText = state.vocalNote;
        
        if (aligned) {
            el.vocalTracker.classList.add('aligned');
            el.vocalResonance.innerText = alignedLabel;
            el.vocalResonance.classList.add('aligned');
            el.statusText.innerText = `RESONANT ALIGNMENT: ${alignedLabel.toUpperCase()}`;
            el.statusDot.className = "pulse-dot active";
        } else {
            el.vocalTracker.classList.remove('aligned');
            el.vocalResonance.innerText = "Active";
            el.vocalResonance.classList.remove('aligned');
            el.statusText.innerText = "CAPTURING ENVIRONMENTAL FIELD";
            el.statusDot.className = "pulse-dot active";
        }
        
        // Update Carrier stat
        el.statCarrier.innerText = `${Math.round(domFreq)} Hz`;
        
        // 5. Map the pitch to Chladni parameters (N, M)
        const mappedN = Math.max(2, Math.min(12, Math.floor(domFreq / 80)));
        const mappedM = Math.max(2, Math.min(12, Math.floor((domFreq % 80) / 8) + 2));
        
        state.targetN = mappedN;
        state.targetM = mappedM;
        
        // Sync sliders
        el.inputNodeN.value = mappedN;
        el.valNodeN.innerText = mappedN;
        el.inputNodeM.value = mappedM;
        el.valNodeM.innerText = mappedM;
        el.geometryLabel.innerText = `Chladni Mode: ${mappedN}, ${mappedM}`;
    } else {
        // No signal detected or too quiet
        state.vocalAligned = false;
        el.vocalFreqReadout.innerText = "0.0";
        el.vocalNoteReadout.innerText = "--";
        el.vocalResonance.innerText = "Silent / Noise";
        el.vocalResonance.classList.remove('aligned');
        el.vocalTracker.classList.remove('aligned');
        el.pitchNeedle.style.left = "50%";
    }
}

// Autocorrelation algorithm for precise pitch tracking
function autoCorrelate(buffer, sampleRate) {
    const SIZE = buffer.length;
    let sumOfSquares = 0;
    
    for (let i = 0; i < SIZE; i++) {
        const val = (buffer[i] - 128) / 128; // Normalize from [0, 255] to [-1, 1]
        sumOfSquares += val * val;
    }
    
    const rms = Math.sqrt(sumOfSquares / SIZE);
    if (rms < 0.02) {
        return -1; // Not enough signal energy
    }
    
    // Find boundaries of signal
    let r1 = 0;
    let r2 = SIZE - 1;
    const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
        if (Math.abs((buffer[i] - 128) / 128) < thres) {
            r1 = i;
        } else {
            break;
        }
    }
    for (let i = SIZE - 1; i >= SIZE / 2; i--) {
        if (Math.abs((buffer[i] - 128) / 128) < thres) {
            r2 = i;
        } else {
            break;
        }
    }
    
    const buf = buffer.slice(r1, r2);
    const len = buf.length;
    
    const correlations = new Float32Array(len);
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len - i; j++) {
            const val1 = (buf[j] - 128) / 128;
            const val2 = (buf[j + i] - 128) / 128;
            correlations[i] += val1 * val2;
        }
    }
    
    // Find first zero crossing / peak
    let d = 0;
    while (correlations[d] > correlations[d + 1]) d++;
    
    let maxval = -1;
    let maxpos = -1;
    for (let i = d; i < len; i++) {
        if (correlations[i] > maxval) {
            maxval = correlations[i];
            maxpos = i;
        }
    }
    
    let T0 = maxpos;
    
    // Parabolic interpolation
    if (T0 > 0 && T0 < len - 1) {
        const alpha = correlations[T0 - 1];
        const beta = correlations[T0];
        const gamma = correlations[T0 + 1];
        const p = 0.5 * (alpha - gamma) / (alpha - 2 * beta + gamma);
        T0 = T0 + p;
    }
    
    return sampleRate / T0;
}

function drawCymatics(audioAmp) {
    const canvas = el.matrixCanvas;
    const ctx = canvas.getContext('2d');
    const config = intentConfig[state.intent];
    
    // Clean canvas with intention trails (fade coefficient)
    ctx.fillStyle = `rgba(4, 4, 9, ${config.trail})`;
    ctx.fillRect(0, 0, state.width, state.height);
    
    // Update and draw particles
    for (let i = 0; i < state.particleCount; i++) {
        const p = state.particles[i];
        p.update(state.nodeN, state.nodeM, config, state.excitation, audioAmp);
        p.draw(ctx, state.width, state.height, config);
    }
    
    // Render "Thought Portal" focus aura if mouse active
    if (state.mouse.active && state.mouse.x !== null) {
        ctx.strokeStyle = `rgba(${state.intent === 'manifest' ? '255, 0, 127' : '0, 242, 254'}, 0.25)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const pulse = 1 + Math.sin(Date.now() / 150) * 0.05;
        ctx.arc(state.mouse.x, state.mouse.y, state.mouse.radius * pulse, 0, Math.PI * 2);
        ctx.stroke();
        
        // Faint glowing inner radial glow
        const grad = ctx.createRadialGradient(state.mouse.x, state.mouse.y, 0, state.mouse.x, state.mouse.y, state.mouse.radius);
        grad.addColorStop(0, `rgba(${state.intent === 'manifest' ? '255, 0, 127' : '0, 242, 254'}, 0.05)`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fill();
    }
    
    // Draw Genesis Flash Burst
    if (state.genesisActive && state.genesisFlash > 0) {
        ctx.save();
        const cx = state.width / 2;
        const cy = state.height / 2;
        const maxRadius = Math.max(state.width, state.height) * 0.7;
        
        // Flash moves outwards as it fades
        const pulseRadius = maxRadius * (1.1 - state.genesisFlash);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(10, pulseRadius));
        grad.addColorStop(0, `rgba(255, 255, 255, ${state.genesisFlash})`);
        grad.addColorStop(0.15, `rgba(255, 215, 0, ${state.genesisFlash * 0.8})`);
        grad.addColorStop(0.4, `rgba(127, 0, 255, ${state.genesisFlash * 0.4})`);
        grad.addColorStop(0.8, `rgba(0, 242, 254, ${state.genesisFlash * 0.15})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, state.width, state.height);
        ctx.restore();
    }
}

function drawWaveOverlay(frequencyArray) {
    const canvas = el.waveCanvas;
    const ctx = canvas.getContext('2d');
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    
    ctx.clearRect(0, 0, w, h);
    
    if (!state.isPlaying || frequencyArray.length === 0) return;
    
    const config = intentConfig[state.intent];
    ctx.strokeStyle = config.color1;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    const sliceWidth = w / (frequencyArray.length / 3); // view lower/middle range
    let x = 0;
    
    for (let i = 0; i < frequencyArray.length / 3; i++) {
        const v = frequencyArray[i] / 255;
        const y = h - (v * h * 0.8) - 2; // leave padding
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
    }
    ctx.stroke();
}

function updateStatsBars(audioAmp) {
    // Entropy: dynamic measure of particle velocities/spread
    // Coherence: inverse of entropy, boosted by intention
    let totalVel = 0;
    for (let i = 0; i < state.particleCount; i++) {
        const p = state.particles[i];
        totalVel += Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    }
    
    const avgVel = totalVel / state.particleCount;
    
    // Map average velocity to entropy percentage
    // Calm lowers entropy, Manifest raises it.
    let baseEntropy = Math.min(100, Math.round(avgVel * 1800));
    if (state.intent === 'calm') baseEntropy *= 0.6;
    if (state.intent === 'manifest') baseEntropy = Math.min(100, baseEntropy * 1.5 + 20);
    
    state.entropy = Math.max(5, Math.round(baseEntropy));
    
    // Coherence calculates based on plate settlement (proximity to node lines)
    // Formula looks at how many particles have settled near absolute nodes
    let nodalProximityCount = 0;
    for (let i = 0; i < state.particleCount; i++) {
        const p = state.particles[i];
        const z = Math.cos(state.nodeN * (Math.PI * (p.x + 1) / 2)) * Math.cos(state.nodeM * (Math.PI * (p.y + 1) / 2)) - 
                  Math.cos(state.nodeM * (Math.PI * (p.x + 1) / 2)) * Math.cos(state.nodeN * (Math.PI * (p.y + 1) / 2));
        if (Math.abs(z) < 0.25) {
            nodalProximityCount++;
        }
    }
    
    const settlementRatio = nodalProximityCount / state.particleCount;
    let baseCoherence = Math.round(settlementRatio * 100);
    
    // Intent alignment impacts coherence
    baseCoherence += state.thoughtAlignment * 0.15;
    if (state.intent === 'focus') baseCoherence += 10;
    
    if (state.vocalAligned) {
        baseCoherence = 100; // perfect coherence when aligned with Solfeggio
    }
    
    state.coherence = Math.max(0, Math.min(100, Math.round(baseCoherence)));
    
    // Render Stats to UI
    el.statCoherence.innerText = `${state.coherence}%`;
    el.barCoherence.style.width = `${state.coherence}%`;
    el.barEntropy.style.width = `${state.entropy}%`;
}

// --- COLOR MATH HELPER ---
function interpolateColor(color1, color2, factor) {
    // Parse hex colors
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    
    // Interpolate
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    
    return `rgb(${r}, ${g}, ${b})`;
}

// --- GENESIS CREATION SEQUENCER ---
function triggerGenesisSequence() {
    initAudio();
    if (state.audioCtx.state === 'suspended') {
        state.audioCtx.resume();
    }
    
    state.isPlaying = true;
    state.genesisActive = true;
    state.genesisTimer = 1.0;
    state.genesisFlash = 1.0;
    
    // UI Updates
    el.btnActivate.classList.add('active');
    el.btnActivate.querySelector('.activate-text').innerText = "DISCONNECT THE GRID";
    el.statusDot.className = "pulse-dot active";
    el.statusText.innerText = "GENESIS: LET THERE BE LIGHT!";
    
    // Intention alignment hits maximum charge
    state.thoughtAlignment = 100;
    el.barThought.style.width = "100%";
    el.thoughtInput.value = "Let there be light";
    
    // Primordial sweep in audio
    stopOscillators();
    stopMicCapture();
    
    if (state.inputSource === 'mic') {
        // Fallback to generator for genesis sound sweep
        setSource('generator');
    }
    
    state.oscillator1 = state.audioCtx.createOscillator();
    state.oscillator1.type = 'sine';
    state.oscillator1.frequency.setValueAtTime(60, state.audioCtx.currentTime); // start deep sub-bass
    state.oscillator1.frequency.exponentialRampToValueAtTime(state.frequency, state.audioCtx.currentTime + 3.0); // sweep to target
    
    state.oscillator2 = state.audioCtx.createOscillator();
    state.oscillator2.type = 'sine';
    state.oscillator2.frequency.setValueAtTime(61.2, state.audioCtx.currentTime);
    state.oscillator2.frequency.exponentialRampToValueAtTime(state.frequency + 1.2, state.audioCtx.currentTime + 3.0);
    
    state.oscillator1.connect(state.gainNode);
    state.oscillator2.connect(state.gainNode);
    
    // Swoosh gain ramp
    state.gainNode.gain.setValueAtTime(0, state.audioCtx.currentTime);
    state.gainNode.gain.linearRampToValueAtTime(state.volume, state.audioCtx.currentTime + 1.5);
    
    state.oscillator1.start();
    state.oscillator2.start();
    
    // Singularity collapsing particles
    for (let i = 0; i < state.particleCount; i++) {
        const p = state.particles[i];
        p.x = 0;
        p.y = 0;
        // Give outwards blast velocities
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.2 + Math.random() * 0.8) * 0.08;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
    }
}

// --- WEB3 INTEGRATION & SMART CONTRACT COUPLING ---
const WEB3_CONFIG = {
    
    
    contractAddress: "0x7e50d24299a7cbda4380a73f08cadda8c7cf451e",
    abi: [
        "function recordResonance(uint256 frequency, uint256 nodeN, uint256 nodeM, string memory intention) public returns (uint256)",
        "event ResonanceRegistered(uint256 indexed tokenId, address indexed creator, uint256 frequency, uint256 nodeN, uint256 nodeM, string intention)"
    ],
    // Zero address signals local simulation mode for the ERC-20 token.
    tokenAddress: "0x0000000000000000000000000000000000000000",
    tokenAbi: [
        "function balanceOf(address account) external view returns (uint256)",
        "function claimFaucet() external",
        "function lastClaimTime(address account) external view returns (uint256)",
        "function FAUCET_COOLDOWN() external view returns (uint256)",
        "function dustShieldEnabled(address account) external view returns (bool)",
        "function toggleDustShield(bool enabled) external"
    ]
};

async function updateTokenBalance() {
    if (!state.walletConnected || !state.userAddress) {
        el.tokenBalance.innerText = "0.00";
        el.btnClaimFaucet.disabled = true;
        el.btnAddToken.disabled = true;
        el.chkDustShield.disabled = true;
        el.chkDustShield.checked = false;
        return;
    }
    
    el.btnAddToken.disabled = false;
    el.btnClaimFaucet.disabled = false;
    el.chkDustShield.disabled = false;

    if (WEB3_CONFIG.tokenAddress === "0x0000000000000000000000000000000000000000") {
        // MOCK MODE: Check balance from localStorage
        let mockBal = localStorage.getItem(`mock_light_balance_${state.userAddress}`);
        if (mockBal === null) {
            mockBal = "1000.00";
            localStorage.setItem(`mock_light_balance_${state.userAddress}`, mockBal);
        }
        el.tokenBalance.innerText = parseFloat(mockBal).toFixed(2);
        
        // Check cooldown
        const lastClaim = parseInt(localStorage.getItem(`mock_last_claim_${state.userAddress}`) || "0");
        const now = Date.now();
        if (now - lastClaim < 24 * 60 * 60 * 1000) {
            el.btnClaimFaucet.innerText = "Claimed (24h)";
            el.btnClaimFaucet.disabled = true;
        } else {
            el.btnClaimFaucet.innerText = "Claim Faucet";
            el.btnClaimFaucet.disabled = false;
        }

        // Check dust shield status
        const isShield = localStorage.getItem(`mock_dust_shield_${state.userAddress}`) === "true";
        el.chkDustShield.checked = isShield;
    } else {
        // REAL MODE: Query the Base network
        try {
            const contract = new ethers.Contract(
                WEB3_CONFIG.tokenAddress,
                WEB3_CONFIG.tokenAbi,
                state.web3Signer
            );
            
            const bal = await contract.balanceOf(state.userAddress);
            el.tokenBalance.innerText = parseFloat(ethers.formatUnits(bal, 18)).toFixed(2);
            
            // Check faucet eligibility
            const lastClaim = await contract.lastClaimTime(state.userAddress);
            const cooldown = await contract.FAUCET_COOLDOWN();
            const lastClaimNum = Number(lastClaim) * 1000;
            const cooldownNum = Number(cooldown) * 1000;
            const now = Date.now();
            
            if (now - lastClaimNum < cooldownNum) {
                el.btnClaimFaucet.innerText = "Claimed (24h)";
                el.btnClaimFaucet.disabled = true;
            } else {
                el.btnClaimFaucet.innerText = "Claim Faucet";
                el.btnClaimFaucet.disabled = false;
            }

            // Check dust shield status on-chain
            const isShield = await contract.dustShieldEnabled(state.userAddress);
            el.chkDustShield.checked = isShield;
        } catch (e) {
            console.error("Failed to query token balance or shield:", e);
            el.tokenBalance.innerText = "ERROR";
        }
    }
}

async function claimFaucetToken() {
    if (!state.walletConnected || !state.userAddress) return;
    
    el.btnClaimFaucet.innerText = "CLAIMING...";
    el.btnClaimFaucet.disabled = true;
    
    try {
        if (WEB3_CONFIG.tokenAddress === "0x0000000000000000000000000000000000000000") {
            // MOCK MODE
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            let mockBal = parseFloat(localStorage.getItem(`mock_light_balance_${state.userAddress}`) || "1000.00");
            mockBal += 100.00;
            localStorage.setItem(`mock_light_balance_${state.userAddress}`, mockBal.toFixed(2));
            localStorage.setItem(`mock_last_claim_${state.userAddress}`, Date.now().toString());
            
            alert("Daily faucet claim successful! +100.00 LIGHT tokens received in mock mode.");
        } else {
            // REAL MODE
            const contract = new ethers.Contract(
                WEB3_CONFIG.tokenAddress,
                WEB3_CONFIG.tokenAbi,
                state.web3Signer
            );
            const tx = await contract.claimFaucet();
            el.statusText.innerText = "AWAITING COOLDOWN BLOCK CONFIRMATION...";
            await tx.wait();
            alert("Daily faucet claim successful! +100.00 LIGHT tokens received.");
        }
        await updateTokenBalance();
    } catch (e) {
        console.error("Failed to claim faucet:", e);
        alert("Faucet claim failed. Ensure cooldown is finished or network is accessible.");
        el.btnClaimFaucet.innerText = "Claim Faucet";
        el.btnClaimFaucet.disabled = false;
    }
}

async function importTokenToWallet() {
    if (!state.walletConnected || !window.ethereum) return;
    
    try {
        const wasAdded = await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: WEB3_CONFIG.tokenAddress === "0x7e50d24299a7cbda4380a73f08cadda8c7cf451e" ? 
                             "0x1111111111111111111111111111111111111111" : WEB3_CONFIG.tokenAddress,
                    symbol: 'LIGHT',
                    decimals: 18,
                    image: 'https://genesis.sophiaserpent.org/app_thumbnail.jpg',
                },
            },
        });
        if (wasAdded) {
            console.log('LIGHT token added to wallet!');
        }
    } catch (error) {
        console.error('Error importing token to wallet:', error);
    }
}

async function toggleDustShield(enabled) {
    if (!state.walletConnected || !state.userAddress) return;
    
    el.chkDustShield.disabled = true;
    try {
        if (WEB3_CONFIG.tokenAddress === "0x7e50d24299a7cbda4380a73f08cadda8c7cf451e") {
            // MOCK MODE
            await new Promise(resolve => setTimeout(resolve, 800));
            localStorage.setItem(`mock_dust_shield_${state.userAddress}`, enabled.toString());
            el.statusText.innerText = `PHISHING SHIELD: ${enabled ? 'ACTIVE' : 'INACTIVE'} (MOCK)`;
        } else {
            // REAL MODE
            const contract = new ethers.Contract(
                WEB3_CONFIG.tokenAddress,
                WEB3_CONFIG.tokenAbi,
                state.web3Signer
            );
            const tx = await contract.toggleDustShield(enabled);
            el.statusText.innerText = "UPDATING SHIELD ON-CHAIN...";
            await tx.wait();
            el.statusText.innerText = `PHISHING SHIELD: ${enabled ? 'ACTIVE' : 'INACTIVE'}`;
        }
    } catch (e) {
        console.error("Failed to toggle dust shield:", e);
        alert("Failed to toggle phishing shield. Try again.");
        el.chkDustShield.checked = !enabled; // revert checkbox
    } finally {
        el.chkDustShield.disabled = false;
    }
}

async function connectWallet() {
    if (typeof window.ethereum === "undefined") {
        alert("Web3 browser extension (e.g. MetaMask, Coinbase Wallet) not detected. Please install a wallet to connect to the matrix.");
        return;
    }
    
    try {
        // Request accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length === 0) return;
        
        // Setup Provider & Signer (Ethers v6 syntax)
        state.web3Provider = new ethers.BrowserProvider(window.ethereum);
        state.web3Signer = await state.web3Provider.getSigner();
        state.userAddress = await state.web3Signer.getAddress();
        state.walletConnected = true;
        
        // Resolve ENS or Basename dynamically using mainnet lookup
        let resolvedLabel = state.userAddress.substring(0, 6) + "..." + state.userAddress.substring(38);
        
        try {
            // Setup Mainnet read-only provider to query ENS
            const mainnetProvider = new ethers.JsonRpcProvider("https://cloudflare-eth.com");
            const ensName = await mainnetProvider.lookupAddress(state.userAddress);
            if (ensName) {
                resolvedLabel = ensName;
            } else if (state.userAddress.toLowerCase() === "0xf52818c3f639ec258288b88888888888888888888") {
                resolvedLabel = "sophiaserpent.base.eth";
            }
        } catch (e) {
            console.warn("ENS resolution failed, using address shorthand:", e);
            if (state.userAddress.toLowerCase() === "0xf52818c3f639ec258288b88888888888888888888") {
                resolvedLabel = "sophiaserpent.base.eth";
            }
        }
            
        state.resolvedName = resolvedLabel;
        
        // Update UI Button
        el.btnConnectWallet.innerText = resolvedLabel;
        el.btnConnectWallet.classList.add('connected');
        
        // Show Mint button in footer
        el.btnMintResonance.classList.remove('hidden');
        
        el.statusText.innerText = `WALLET CONNECTED: ${resolvedLabel.toUpperCase()}`;
        el.statusDot.className = "pulse-dot active";
        
        // Fetch/Update LIGHT Balance
        await updateTokenBalance();
    } catch (err) {
        console.error("Wallet connection failed:", err);
        el.statusDot.className = "pulse-dot warning";
        el.statusText.innerText = "WALLET CONTEXT DENIED";
    }
}

async function mintResonanceNFT() {
    if (!state.walletConnected) {
        connectWallet();
        return;
    }
    
    // Calculate active fee based on intention (Tesla Tiers 3, 6, 9)
    const ethFee = state.intent === "manifest" ? "0.002"
                 : state.intent === "transcend" ? "0.003"
                 : "0.001";
    const feeValue = ethers.parseEther(ethFee);
    
    // Set loading indicator on button
    const originalText = el.btnMintResonance.innerText;
    el.btnMintResonance.innerText = "RECORDING TO MATRIX...";
    el.btnMintResonance.disabled = true;
    
    try {
        if (WEB3_CONFIG.contractAddress === "0x0000000000000000000000000000000000000000") {
            // MOCK MODE: Run a beautiful simulated on-chain transaction for immediate playability
            el.statusText.innerText = "BROADCASTING TO SIMULATED BASE LEDGER...";
            
            // Artificial delay to simulate block time
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Reward 500 LIGHT tokens for aligning the field
            let mockBal = parseFloat(localStorage.getItem(`mock_light_balance_${state.userAddress}`) || "1000.00");
            mockBal += 500.00;
            localStorage.setItem(`mock_light_balance_${state.userAddress}`, mockBal.toFixed(2));
            await updateTokenBalance();

            // Generate and show on-chain dynamic SVG in a modal popup
            const mockResonance = {
                frequency: state.frequency,
                nodeN: state.targetN,
                nodeM: state.targetM,
                intention: state.intent,
                creator: state.userAddress
            };
            const generatedSvg = generateOnChainSVG(mockResonance);
            showOnChainNFTModal(generatedSvg, mockResonance, ethFee);
            
            el.statusText.innerText = "RESONANCE MINTED & +500 LIGHT REWARD!";
            el.statusDot.className = "pulse-dot active";
        } else {
            // REAL MODE: Broadcast transaction to active network
            el.statusText.innerText = "SENDING ON-CHAIN TRANSACTION...";
            
            const contract = new ethers.Contract(
                WEB3_CONFIG.contractAddress,
                WEB3_CONFIG.abi,
                state.web3Signer
            );
            
            // Record resonance with required value payment (payable)
            const tx = await contract.recordResonance(
                Math.round(state.frequency),
                state.targetN,
                state.targetM,
                state.intent,
                { value: feeValue }
            );
            
            el.statusText.innerText = "AWAITING BLOCK CONFIRMATION...";
            const receipt = await tx.wait();
            
            el.statusText.innerText = "RESONANCE NFT SUCCESSFULLY MINTED!";
            el.statusDot.className = "pulse-dot active";
            alert(`NFT successfully minted! Transaction: ${receipt.hash}`);
            await updateTokenBalance();
        }
    } catch (err) {
        console.error("Resonance recording failed:", err);
        el.statusText.innerText = "RECORDING FAILED / REJECTED";
        el.statusDot.className = "pulse-dot warning";
    } finally {
        // Re-trigger update to restore button text with dynamic pricing
        updateUIColors();
        el.btnMintResonance.disabled = false;
    }
}

// Client-side representation of the Solidity dynamic SVG generator
function generateOnChainSVG(res) {
    const color = res.intention === "focus" ? "#00f2fe" 
                : res.intention === "calm" ? "#05ffa1" 
                : res.intention === "manifest" ? "#ff007f" 
                : res.intention === "transcend" ? "#ffd166" 
                : "#ffffff";
                
    let lines = "";
    // Horizontal lines
    for (let i = 1; i <= res.nodeN; i++) {
        const x = (400 * i) / (res.nodeN + 1) + 50;
        lines += `<line x1="${x}" y1="50" x2="${x}" y2="450" stroke="${color}" stroke-width="1.5" opacity="0.3"/>`;
    }
    // Vertical lines
    for (let j = 1; j <= res.nodeM; j++) {
        const y = (400 * j) / (res.nodeM + 1) + 50;
        lines += `<line x1="50" y1="${y}" x2="450" y2="${y}" stroke="${color}" stroke-width="1.5" opacity="0.3"/>`;
    }
    
    // Central concentric circles
    let circles = "";
    const circlesCount = Math.floor((res.nodeN + res.nodeM) / 2);
    for (let k = 1; k <= circlesCount; k++) {
        const r = 25 * k;
        circles += `<circle cx="250" cy="250" r="${r}" stroke="url(#accentGrad)" stroke-width="1" fill="none" opacity="${(1 / k).toFixed(2)}" stroke-dasharray="${k * 4}, ${k * 2}"/>`;
    }
    
    return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="300" height="300">
            <rect width="100%" height="100%" fill="#040409"/>
            <defs>
                <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${color}"/>
                    <stop offset="100%" stop-color="#7f00ff"/>
                </linearGradient>
            </defs>
            <rect x="50" y="50" width="400" height="400" fill="none" stroke="url(#accentGrad)" stroke-width="2" rx="10"/>
            ${lines}
            ${circles}
            <text x="250" y="475" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="middle" letter-spacing="1">
                ${res.frequency}HZ | CHLADNI: ${res.nodeN},${res.nodeM} | ${res.intention.toUpperCase()}
            </text>
        </svg>
    `;
}

function showOnChainNFTModal(svgContent, res, ethFee) {
    // Create popup modal container dynamically
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(3, 3, 7, 0.85)';
    modal.style.backdropFilter = 'blur(10px)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '9999';
    modal.style.animation = 'fadeIn 0.3s ease';
    
    const content = document.createElement('div');
    content.className = 'glass';
    content.style.maxWidth = '400px';
    content.style.padding = '2rem';
    content.style.textAlign = 'center';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.gap = '1.5rem';
    content.style.border = '1px solid rgba(255, 255, 255, 0.15)';
    content.style.boxShadow = '0 0 30px rgba(0, 242, 254, 0.15)';
    content.style.alignItems = 'center';
    
    const title = document.createElement('h3');
    title.innerText = "ON-CHAIN RESONANCE NFT";
    title.style.fontFamily = 'var(--font-display)';
    title.style.color = '#ffffff';
    title.style.letterSpacing = '0.08em';
    title.style.fontSize = '1.2rem';
    
    const desc = document.createElement('p');
    desc.style.fontSize = '0.8rem';
    desc.style.color = '#94a3b8';
    
    const strongName = document.createElement('strong');
    strongName.textContent = state.resolvedName;
    
    const strongFee = document.createElement('strong');
    strongFee.textContent = `${ethFee} ETH`;
    
    desc.appendChild(document.createTextNode("Synthesized successfully for "));
    desc.appendChild(strongName);
    desc.appendChild(document.createElement('br'));
    desc.appendChild(document.createTextNode("Value committed: "));
    desc.appendChild(strongFee);
    desc.appendChild(document.createTextNode(". This dynamic SVG artwork is generated entirely on-chain by the smart contract code."));
    
    const svgWrapper = document.createElement('div');
    svgWrapper.innerHTML = svgContent;
    svgWrapper.style.borderRadius = '8px';
    svgWrapper.style.overflow = 'hidden';
    svgWrapper.style.border = '1px solid rgba(255, 255, 255, 0.08)';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'action-btn glow';
    closeBtn.innerText = "DISMISS RECORD";
    closeBtn.style.padding = '0.6rem 1.5rem';
    closeBtn.style.fontSize = '0.8rem';
    closeBtn.addEventListener('click', () => {
        modal.style.animation = 'fadeIn 0.3s reverse';
        setTimeout(() => modal.remove(), 250);
    });
    
    content.appendChild(title);
    content.appendChild(svgWrapper);
    content.appendChild(desc);
    content.appendChild(closeBtn);
    modal.appendChild(content);
    
    document.body.appendChild(modal);
}

// --- BOOTSTRAP ---
window.onload = init;
