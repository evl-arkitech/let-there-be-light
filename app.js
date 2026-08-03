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
    
    // Genesis / Big Bang cosmology
    genesisActive: false,
    genesisTimer: 0,       // overall progress 1 → 0
    genesisFlash: 0,
    genesisPhase: null,    // singularity | planck | inflation | plasma | recombination | structure
    genesisShockwaves: [], // expanding ring radii (0–1)
    hubbleConstant: 0,     // expansion rate applied as H * r
    
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
    btnConnectWallet: document.getElementById('btn-connect-wallet'),
    btnMintResonance: document.getElementById('btn-mint-resonance'),
    
    // Epoch HUD
    epochHud: document.getElementById('epoch-hud'),
    epochPhase: document.getElementById('epoch-phase'),
    epochTime: document.getElementById('epoch-time'),
    epochTemp: document.getElementById('epoch-temp'),
    epochProgress: document.getElementById('epoch-progress'),
    epochDesc: document.getElementById('epoch-desc'),
    
    // LIGHT Token elements
    tokenBalance: document.getElementById('token-balance'),
    btnClaimFaucet: document.getElementById('btn-claim-faucet'),
    btnAddToken: document.getElementById('btn-add-token'),
    chkDustShield: document.getElementById('chk-dust-shield'),
    
    starfieldCanvas: document.getElementById('starfield-canvas')
};

// Cosmological epoch definitions (progress from 1 → 0; phase keyed by remaining timer bands)
const GENESIS_EPOCHS = [
    {
        id: 'singularity',
        label: 'SINGULARITY',
        min: 0.88,
        time: 't ≈ 0',
        temp: 'T → ∞',
        desc: 'All energy compressed into a dimensionless point'
    },
    {
        id: 'planck',
        label: 'PLANCK EPOCH',
        min: 0.78,
        time: 't ~ 10⁻⁴³ s',
        temp: 'T ~ 10³² K',
        desc: 'Quantum foam — gravity unifies with the other forces'
    },
    {
        id: 'inflation',
        label: 'COSMIC INFLATION',
        min: 0.55,
        time: 't ~ 10⁻³⁶ s',
        temp: 'T ~ 10²⁷ K',
        desc: 'Exponential expansion — space itself stretches faster than light'
    },
    {
        id: 'plasma',
        label: 'QUARK–GLUON PLASMA',
        min: 0.35,
        time: 't ~ 10⁻¹² s',
        temp: 'T ~ 10¹⁵ K',
        desc: 'Hot dense soup of free quarks, gluons, and radiation'
    },
    {
        id: 'recombination',
        label: 'RECOMBINATION',
        min: 0.15,
        time: 't ~ 380,000 yr',
        temp: 'T ~ 3000 K',
        desc: 'Atoms form — universe becomes transparent; CMB is released'
    },
    {
        id: 'structure',
        label: 'STRUCTURE FORMATION',
        min: 0,
        time: 't → now',
        temp: 'T ~ 2.7 K',
        desc: 'Matter settles into geometric order — the cosmic web emerges'
    }
];

// --- INITIALIZATION ---
function init() {
    setupCanvas();
    createParticles();
    bindEvents();
    updateUIColors();
    initStarfield();
    
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
        this.temp = 0;               // cosmological temperature proxy during genesis
        this.redshift = 0;           // Doppler / expansion redshift 0–1
        this.trailX = this.x;
        this.trailY = this.y;
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
        
        // During early genesis epochs, Chladni forces are suppressed (pre-structure universe)
        const structureBlend = getGenesisStructureBlend();
        this.vx -= gradX * force * structureBlend;
        this.vy -= gradY * force * structureBlend;
        
        // Shaking noise — amplified during plasma epoch
        const thermalBoost = getGenesisThermalNoise();
        this.vx += (Math.random() - 0.5) * absZ * noiseFactor * (1 + thermalBoost);
        this.vy += (Math.random() - 0.5) * absZ * noiseFactor * (1 + thermalBoost);
        
        // Multi-phase Big Bang cosmology forces
        if (state.genesisActive) {
            applyGenesisForces(this);
        }
        
        // Apply friction (lower friction during inflation = free expansion)
        const friction = state.genesisActive && state.genesisPhase === 'inflation'
            ? 0.995
            : config.friction;
        this.vx *= friction;
        this.vy *= friction;
        
        // Trail for redshift streaks
        this.trailX = this.x;
        this.trailY = this.y;
        
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
        
        // Cosmological coloring during Big Bang
        if (state.genesisActive) {
            baseColor = getGenesisParticleColor(this, speed);
            
            // Doppler / expansion trail streak
            if (this.redshift > 0.15 && speed > 0.01) {
                const tx = ((this.trailX + 1) / 2) * w;
                const ty = ((this.trailY + 1) / 2) * h;
                ctx.strokeStyle = baseColor.replace('rgb', 'rgba').replace(')', `, ${0.35 * this.redshift})`);
                // Fallback if color is already rgba or hex
                if (baseColor.startsWith('#')) {
                    ctx.strokeStyle = hexToRgba(baseColor, 0.35 * this.redshift);
                } else if (baseColor.startsWith('rgb(')) {
                    ctx.strokeStyle = baseColor.replace('rgb(', 'rgba(').replace(')', `, ${0.35 * this.redshift})`);
                } else {
                    ctx.strokeStyle = baseColor;
                }
                ctx.lineWidth = Math.max(0.5, config.particleSize * (0.6 + this.redshift));
                ctx.beginPath();
                ctx.moveTo(tx, ty);
                ctx.lineTo(cx, cy);
                ctx.stroke();
            }
        }
        
        ctx.fillStyle = baseColor;
        
        // Render particle
        ctx.beginPath();
        let size = config.particleSize * (1 + state.thoughtAlignment / 100);
        if (state.vocalAligned) {
            size *= 1.8; // swell particles during vocal resonance alignment
        }
        if (state.genesisActive) {
            size *= getGenesisParticleSizeScale(this);
        }
        ctx.arc(cx, cy, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Focus/Coherence connectors
        if (state.intent === 'focus' && state.thoughtAlignment > 30 && !state.genesisActive) {
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
    
    // Advance Big Bang cosmology timeline
    if (state.genesisActive) {
        advanceGenesisTimeline();
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
    
    // 6. Ambient starfield
    drawStarfield();
    
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
    // During singularity, fade faster toward black void
    let trail = config.trail;
    if (state.genesisActive) {
        if (state.genesisPhase === 'singularity') trail = 0.35;
        else if (state.genesisPhase === 'planck') trail = 0.08;
        else if (state.genesisPhase === 'inflation') trail = 0.12;
        else if (state.genesisPhase === 'plasma') trail = 0.18;
        else if (state.genesisPhase === 'recombination') trail = 0.22;
        else trail = config.trail;
    }
    ctx.fillStyle = `rgba(4, 4, 9, ${trail})`;
    ctx.fillRect(0, 0, state.width, state.height);
    
    // Update and draw particles
    for (let i = 0; i < state.particleCount; i++) {
        const p = state.particles[i];
        p.update(state.nodeN, state.nodeM, config, state.excitation, audioAmp);
        p.draw(ctx, state.width, state.height, config);
    }
    
    // Render "Thought Portal" focus aura if mouse active
    if (state.mouse.active && state.mouse.x !== null && !state.genesisActive) {
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
    
    // Draw cosmological overlays (flash, shockwaves, CMB)
    if (state.genesisActive) {
        drawGenesisOverlays(ctx);
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

// --- GENESIS / BIG BANG COSMOLOGY ENGINE ---

function getGenesisStructureBlend() {
    if (!state.genesisActive) return 1;
    const t = state.genesisTimer;
    if (t > 0.55) return 0.02;           // pre-structure
    if (t > 0.35) return 0.15;           // plasma — weak geometry
    if (t > 0.15) return 0.45;           // recombination
    return 0.35 + (1 - t / 0.15) * 0.65; // structure formation ramp
}

function getGenesisThermalNoise() {
    if (!state.genesisActive) return 0;
    switch (state.genesisPhase) {
        case 'singularity': return 0.2;
        case 'planck': return 2.5;
        case 'inflation': return 0.4;
        case 'plasma': return 3.2;
        case 'recombination': return 1.0;
        case 'structure': return 0.3;
        default: return 0;
    }
}

function applyGenesisForces(p) {
    const phase = state.genesisPhase;
    const r = Math.sqrt(p.x * p.x + p.y * p.y) || 0.0001;
    const ux = p.x / r;
    const uy = p.y / r;
    
    if (phase === 'singularity') {
        // Collapse toward origin
        const pull = 0.08 + state.genesisTimer * 0.04;
        p.vx -= p.x * pull;
        p.vy -= p.y * pull;
        p.temp = 1;
        p.redshift = 0;
    } else if (phase === 'planck') {
        // Violent jitter at the origin, slight radial kick
        p.vx += (Math.random() - 0.5) * 0.12;
        p.vy += (Math.random() - 0.5) * 0.12;
        p.vx += ux * 0.02;
        p.vy += uy * 0.02;
        p.temp = 1;
        p.redshift = 0.1;
    } else if (phase === 'inflation') {
        // Hubble flow: v = H * r  (exponential expansion of space)
        const H = state.hubbleConstant;
        p.vx += p.x * H;
        p.vy += p.y * H;
        // Extra boost for near-center particles so nothing stays stuck
        if (r < 0.08) {
            const angle = p.charge * Math.PI * 2;
            p.vx += Math.cos(angle) * H * 2;
            p.vy += Math.sin(angle) * H * 2;
        }
        p.temp = 0.85;
        p.redshift = Math.min(1, r * 0.7 + 0.2);
    } else if (phase === 'plasma') {
        // Continuing milder expansion + thermal scatter
        p.vx += p.x * state.hubbleConstant * 0.35;
        p.vy += p.y * state.hubbleConstant * 0.35;
        p.vx += (Math.random() - 0.5) * 0.06;
        p.vy += (Math.random() - 0.5) * 0.06;
        p.temp = 0.7 + Math.random() * 0.3;
        const radialSpeed = (p.vx * ux + p.vy * uy);
        p.redshift = Math.min(1, Math.max(0, radialSpeed * 8 + r * 0.4));
    } else if (phase === 'recombination') {
        // Decelerating expansion, cooling
        p.vx += p.x * state.hubbleConstant * 0.12;
        p.vy += p.y * state.hubbleConstant * 0.12;
        p.temp = Math.max(0.15, state.genesisTimer);
        p.redshift = Math.min(1, r * 0.35);
    } else if (phase === 'structure') {
        // Expansion fades; Chladni takes over via structureBlend
        p.temp = Math.max(0, state.genesisTimer * 0.8);
        p.redshift = Math.max(0, p.redshift * 0.96);
    }
}

function getGenesisParticleColor(p, speed) {
    const phase = state.genesisPhase;
    if (phase === 'singularity') {
        return interpolateColor('#1a1020', '#ffc857', Math.min(1, 0.3 + (1 - Math.min(1, Math.sqrt(p.x * p.x + p.y * p.y) * 8)) * 0.7));
    }
    if (phase === 'planck') {
        return interpolateColor('#ffffff', '#ffc857', Math.random() * 0.4);
    }
    if (phase === 'inflation') {
        // Blue-shift near center, red-shift at edge (relativistic look)
        return interpolateColor('#3de7ff', '#ff3d8a', p.redshift);
    }
    if (phase === 'plasma') {
        // Quark-gluon: white-hot → gold → plasma orange → magenta by temperature
        const hot = interpolateColor('#ffffff', '#ffc857', 1 - p.temp);
        return interpolateColor(hot, '#ff6b35', Math.min(1, speed * 15 + p.charge * 0.4));
    }
    if (phase === 'recombination') {
        // Cooling toward CMB sepia / gold mist
        return interpolateColor('#ff8f5a', '#c4a882', 1 - p.temp);
    }
    // Structure — fade back toward intent colors
    const config = intentConfig[state.intent];
    const cosmic = interpolateColor('#c4a882', config.color1, 1 - state.genesisTimer / 0.15);
    return interpolateColor(cosmic, config.color2, Math.min(1, speed * 12));
}

function getGenesisParticleSizeScale(p) {
    switch (state.genesisPhase) {
        case 'singularity': return 0.4 + (1 - Math.min(1, Math.sqrt(p.x * p.x + p.y * p.y) * 6)) * 1.8;
        case 'planck': return 2.2 + Math.random() * 1.5;
        case 'inflation': return 0.7 + p.redshift * 0.8;
        case 'plasma': return 1.1 + p.temp * 0.9;
        case 'recombination': return 1.3 + p.temp * 0.4;
        default: return 1 + (1 - state.genesisTimer / 0.15) * 0.2;
    }
}

function hexToRgba(hex, alpha) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function resolveGenesisPhase(timer) {
    for (const epoch of GENESIS_EPOCHS) {
        if (timer >= epoch.min) return epoch;
    }
    return GENESIS_EPOCHS[GENESIS_EPOCHS.length - 1];
}

function advanceGenesisTimeline() {
    const prevPhase = state.genesisPhase;
    
    // ~8 seconds total sequence (timer 1 → 0)
    state.genesisTimer -= 0.00205;
    state.genesisFlash = Math.max(0, state.genesisFlash - 0.006);
    
    // Hubble constant peaks during inflation, then decays
    const t = state.genesisTimer;
    if (t > 0.78) {
        state.hubbleConstant = 0;
    } else if (t > 0.55) {
        // Inflation: ramp then hold high H
        const inflProg = (0.78 - t) / 0.23;
        state.hubbleConstant = 0.012 + inflProg * 0.028;
    } else if (t > 0.35) {
        state.hubbleConstant = 0.01 * ((t - 0.35) / 0.2);
    } else if (t > 0.15) {
        state.hubbleConstant = 0.004 * ((t - 0.15) / 0.2);
    } else {
        state.hubbleConstant = 0.001 * (t / 0.15);
    }
    
    // Expand shockwave rings
    state.genesisShockwaves = state.genesisShockwaves
        .map(s => ({ ...s, r: s.r + s.speed, alpha: s.alpha * 0.985 }))
        .filter(s => s.alpha > 0.02 && s.r < 1.6);
    
    const epoch = resolveGenesisPhase(Math.max(0, t));
    state.genesisPhase = epoch.id;
    
    // Emit shockwave when entering inflation / plasma / recombination
    if (prevPhase !== epoch.id) {
        if (epoch.id === 'planck' || epoch.id === 'inflation' || epoch.id === 'recombination') {
            state.genesisShockwaves.push({ r: 0.02, speed: 0.018, alpha: 0.85 });
        }
        if (epoch.id === 'planck') {
            state.genesisFlash = 1.0;
        }
        updateEpochHud(epoch);
        el.statusText.innerText = `GENESIS · ${epoch.label}`;
    }
    
    // Update progress bar every frame
    if (el.epochProgress) {
        el.epochProgress.style.width = `${Math.max(0, (1 - Math.max(0, t)) * 100)}%`;
    }
    
    if (state.genesisTimer <= 0) {
        endGenesisSequence();
    }
}

function updateEpochHud(epoch) {
    if (!el.epochHud) return;
    el.epochHud.classList.remove('hidden');
    el.epochPhase.innerText = epoch.label;
    el.epochTime.innerText = epoch.time;
    el.epochTemp.innerText = epoch.temp;
    el.epochDesc.innerText = epoch.desc;
}

function endGenesisSequence() {
    state.genesisActive = false;
    state.genesisPhase = null;
    state.genesisTimer = 0;
    state.hubbleConstant = 0;
    state.genesisShockwaves = [];
    document.body.classList.remove('genesis-active');
    if (el.epochHud) el.epochHud.classList.add('hidden');
    if (el.btnGenesis) el.btnGenesis.disabled = false;
    el.statusText.innerText = "FIELD STABILIZED · STRUCTURE FORMED";
    el.statusDot.className = "pulse-dot active";
    
    // Soft-reset particle thermal state
    for (let i = 0; i < state.particleCount; i++) {
        state.particles[i].temp = 0;
        state.particles[i].redshift = 0;
    }
}

function drawGenesisOverlays(ctx) {
    const cx = state.width / 2;
    const cy = state.height / 2;
    const maxR = Math.hypot(state.width, state.height) * 0.55;
    
    ctx.save();
    
    // CMB mist during recombination / early structure
    if (state.genesisPhase === 'recombination' || state.genesisPhase === 'structure') {
        const mistAlpha = state.genesisPhase === 'recombination'
            ? 0.12 * state.genesisTimer
            : 0.06 * (state.genesisTimer / 0.15);
        const mist = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.9);
        mist.addColorStop(0, `rgba(196, 168, 130, ${mistAlpha * 0.5})`);
        mist.addColorStop(0.45, `rgba(255, 180, 100, ${mistAlpha * 0.25})`);
        mist.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = mist;
        ctx.fillRect(0, 0, state.width, state.height);
    }
    
    // Shockwave rings
    for (const wave of state.genesisShockwaves) {
        const radius = wave.r * maxR;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 220, 160, ${wave.alpha * 0.7})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.97, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(61, 231, 255, ${wave.alpha * 0.35})`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // Central singularity / Planck flash
    if (state.genesisFlash > 0) {
        const pulseRadius = Math.max(8, maxR * (1.05 - state.genesisFlash) * (state.genesisPhase === 'planck' ? 0.5 : 0.85));
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseRadius);
        if (state.genesisPhase === 'singularity') {
            grad.addColorStop(0, `rgba(255, 255, 255, ${state.genesisFlash * 0.9})`);
            grad.addColorStop(0.2, `rgba(255, 200, 87, ${state.genesisFlash * 0.5})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else if (state.genesisPhase === 'planck') {
            grad.addColorStop(0, `rgba(255, 255, 255, ${state.genesisFlash})`);
            grad.addColorStop(0.12, `rgba(255, 240, 200, ${state.genesisFlash * 0.9})`);
            grad.addColorStop(0.35, `rgba(255, 107, 53, ${state.genesisFlash * 0.45})`);
            grad.addColorStop(0.7, `rgba(61, 231, 255, ${state.genesisFlash * 0.18})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
            grad.addColorStop(0, `rgba(255, 255, 255, ${state.genesisFlash * 0.55})`);
            grad.addColorStop(0.25, `rgba(255, 200, 87, ${state.genesisFlash * 0.3})`);
            grad.addColorStop(0.6, `rgba(61, 231, 255, ${state.genesisFlash * 0.12})`);
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, state.width, state.height);
    }
    
    // Inflation whiteout edge bloom
    if (state.genesisPhase === 'inflation') {
        const bloom = ctx.createRadialGradient(cx, cy, maxR * 0.2, cx, cy, maxR);
        bloom.addColorStop(0, 'rgba(0,0,0,0)');
        bloom.addColorStop(0.7, `rgba(61, 231, 255, ${0.04 * state.hubbleConstant * 40})`);
        bloom.addColorStop(1, `rgba(255, 61, 138, ${0.06 * state.hubbleConstant * 40})`);
        ctx.fillStyle = bloom;
        ctx.fillRect(0, 0, state.width, state.height);
    }
    
    ctx.restore();
}

function playGenesisAudio() {
    stopOscillators();
    stopMicCapture();
    
    if (state.inputSource === 'mic') {
        setSource('generator');
    }
    
    const ctx = state.audioCtx;
    const now = ctx.currentTime;
    
    // Deep primordial rumble
    state.oscillator1 = ctx.createOscillator();
    state.oscillator1.type = 'sine';
    state.oscillator1.frequency.setValueAtTime(28, now);
    state.oscillator1.frequency.exponentialRampToValueAtTime(80, now + 1.2);
    state.oscillator1.frequency.exponentialRampToValueAtTime(state.frequency * 0.5, now + 4.5);
    state.oscillator1.frequency.exponentialRampToValueAtTime(state.frequency, now + 7.5);
    
    // Detuned twin for binaural / beating feel
    state.oscillator2 = ctx.createOscillator();
    state.oscillator2.type = 'sine';
    state.oscillator2.frequency.setValueAtTime(30.5, now);
    state.oscillator2.frequency.exponentialRampToValueAtTime(82, now + 1.2);
    state.oscillator2.frequency.exponentialRampToValueAtTime(state.frequency * 0.5 + 1.4, now + 4.5);
    state.oscillator2.frequency.exponentialRampToValueAtTime(state.frequency + 1.2, now + 7.5);
    
    // Noise burst for Planck flash (filtered)
    const bufferSize = ctx.sampleRate * 1.5;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.35));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(200, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(4000, now + 0.8);
    noiseFilter.Q.value = 0.7;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(state.volume * 0.55, now + 0.9);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(state.gainNode);
    
    state.oscillator1.connect(state.gainNode);
    state.oscillator2.connect(state.gainNode);
    
    state.gainNode.gain.cancelScheduledValues(now);
    state.gainNode.gain.setValueAtTime(0.0001, now);
    state.gainNode.gain.exponentialRampToValueAtTime(Math.max(0.001, state.volume * 0.35), now + 0.6);
    state.gainNode.gain.linearRampToValueAtTime(state.volume, now + 2.0);
    state.gainNode.gain.linearRampToValueAtTime(state.volume * 0.85, now + 7.5);
    
    state.oscillator1.start(now);
    state.oscillator2.start(now);
    noise.start(now + 0.85);
    noise.stop(now + 2.5);
}

function triggerGenesisSequence() {
    if (state.genesisActive) return;
    
    initAudio();
    if (state.audioCtx.state === 'suspended') {
        state.audioCtx.resume();
    }
    
    // Dismiss welcome overlay if still visible
    if (el.welcomeOverlay && !el.welcomeOverlay.classList.contains('hidden')) {
        el.welcomeOverlay.classList.add('hidden');
    }
    
    state.isPlaying = true;
    state.genesisActive = true;
    state.genesisTimer = 1.0;
    state.genesisFlash = 0.55;
    state.genesisPhase = 'singularity';
    state.genesisShockwaves = [];
    state.hubbleConstant = 0;
    
    document.body.classList.add('genesis-active');
    if (el.btnGenesis) el.btnGenesis.disabled = true;
    
    // UI Updates
    el.btnActivate.classList.add('active');
    el.btnActivate.querySelector('.activate-text').innerText = "DISCONNECT THE GRID";
    el.statusDot.className = "pulse-dot active";
    el.statusText.innerText = "GENESIS · SINGULARITY";
    
    // Intention alignment hits maximum charge
    state.thoughtAlignment = 100;
    el.barThought.style.width = "100%";
    el.thoughtInput.value = "Let there be light";
    
    updateEpochHud(GENESIS_EPOCHS[0]);
    if (el.epochProgress) el.epochProgress.style.width = '0%';
    
    playGenesisAudio();
    
    // Collapse all particles into a tight singularity with tiny seed velocities
    for (let i = 0; i < state.particleCount; i++) {
        const p = state.particles[i];
        const angle = (i / state.particleCount) * Math.PI * 2 + p.charge;
        const seed = 0.002 + Math.random() * 0.012;
        p.x = Math.cos(angle) * seed;
        p.y = Math.sin(angle) * seed;
        p.vx = Math.cos(angle) * 0.002;
        p.vy = Math.sin(angle) * 0.002;
        p.temp = 1;
        p.redshift = 0;
        p.trailX = p.x;
        p.trailY = p.y;
    }
}

// --- WEB3 INTEGRATION & SMART CONTRACT COUPLING ---
const WEB3_CONFIG = {
    // Zero address signals local simulation mode. Users can deploy GenesisResonance.sol
    // to Base and replace this address with their deployed contract address.
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
                    address: WEB3_CONFIG.tokenAddress === "0x0000000000000000000000000000000000000000" ? 
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
        if (WEB3_CONFIG.tokenAddress === "0x0000000000000000000000000000000000000000") {
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

// --- 3D PHOTOREALISTIC PLANET OBSERVER ENGINE ---
const planetObserver = {
    scene: null,
    camera: null,
    renderer: null,
    planetMesh: null,
    atmosphereMesh: null,
    currentPlanet: 'earth',
    animId: null,
    initialized: false,

    data: {
        earth: {
            name: 'EARTH (TERRA)',
            schumann: '7.83 Hz (Primary)',
            color: 0x1d4ed8,
            atmosphereColor: 0x38bdf8,
            specular: 0x333333,
            shininess: 25
        },
        mars: {
            name: 'MARS (ARES)',
            schumann: '13.0 Hz (Dust Dynamics)',
            color: 0xc2410c,
            atmosphereColor: 0xf97316,
            specular: 0x111111,
            shininess: 5
        },
        jupiter: {
            name: 'JUPITER (ZEUS)',
            schumann: '27.3 Hz (Magnetospheric Resonance)',
            color: 0xd97706,
            atmosphereColor: 0xfcd34d,
            specular: 0x222222,
            shininess: 10
        },
        sol: {
            name: 'SOL (THE SUN)',
            schumann: '5.0 mHz (Helioseismic p-mode)',
            color: 0xf59e0b,
            atmosphereColor: 0xfef08a,
            specular: 0xffffff,
            shininess: 100
        }
    },

    init() {
        const container = document.getElementById('planet-canvas-container');
        if (!container || typeof THREE === 'undefined') return;

        if (this.initialized) {
            this.resize();
            return;
        }

        const width = container.clientWidth || 280;
        const height = container.clientHeight || 240;

        // Clear existing children in container
        container.innerHTML = '';

        // Scene & Camera
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.z = 2.8;

        // Renderer with WebGL error fallback
        try {
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            container.appendChild(this.renderer.domElement);
        } catch (e) {
            console.error('WebGL initialization error in PlanetObserver:', e);
            container.innerHTML = '<div style="color:#ef4444;font-size:0.75rem;padding:1rem;text-align:center;">WebGL Context Error</div>';
            return;
        }

        // Lighting
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
        dirLight.position.set(5, 3, 5);
        this.scene.add(dirLight);

        const ambientLight = new THREE.AmbientLight(0x1e293b, 0.5);
        this.scene.add(ambientLight);

        // Procedural Planet Mesh
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        const material = new THREE.MeshPhongMaterial({
            color: this.data.earth.color,
            emissive: 0x030712,
            specular: this.data.earth.specular,
            shininess: this.data.earth.shininess,
            wireframe: false
        });
        this.planetMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.planetMesh);

        // Atmosphere Glow (Rayleigh scattering shell)
        const atmosGeom = new THREE.SphereGeometry(1.12, 64, 64);
        const atmosMat = new THREE.MeshLambertMaterial({
            color: this.data.earth.atmosphereColor,
            transparent: true,
            opacity: 0.35,
            side: THREE.BackSide
        });
        this.atmosphereMesh = new THREE.Mesh(atmosGeom, atmosMat);
        this.scene.add(this.atmosphereMesh);

        // Planet Button Controls
        document.querySelectorAll('.planet-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.planet-select-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const targetPlanet = e.currentTarget.getAttribute('data-planet');
                this.selectPlanet(targetPlanet);
            });
        });

        window.addEventListener('resize', () => this.resize());
        this.initialized = true;
        this.animate();
    },

    resize() {
        const container = document.getElementById('planet-canvas-container');
        if (!container || !this.renderer || !this.camera) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width > 0 && height > 0) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    },

    selectPlanet(planetKey) {
        if (!this.data[planetKey] || !this.planetMesh || !this.atmosphereMesh) return;
        this.currentPlanet = planetKey;
        const info = this.data[planetKey];

        const nameElem = document.getElementById('planet-name-display');
        const schumannElem = document.getElementById('planet-schumann-display');
        if (nameElem) nameElem.textContent = info.name;
        if (schumannElem) schumannElem.textContent = `Schumann Base: ${info.schumann}`;

        // Dynamic transition of planet material properties
        this.planetMesh.material.color.setHex(info.color);
        this.planetMesh.material.specular.setHex(info.specular);
        this.planetMesh.material.shininess = info.shininess;
        this.atmosphereMesh.material.color.setHex(info.atmosphereColor);

        if (planetKey === 'sol') {
            this.planetMesh.material.emissive.setHex(0xf59e0b);
            this.atmosphereMesh.material.opacity = 0.65;
        } else {
            this.planetMesh.material.emissive.setHex(0x030712);
            this.atmosphereMesh.material.opacity = 0.35;
        }
    },

    animate() {
        if (this.animId) cancelAnimationFrame(this.animId);
        this.animId = requestAnimationFrame(() => this.animate());

        if (!this.renderer || !this.scene || !this.camera) return;

        // Axial Rotation modulated by current Solfeggio audio frequency state
        const rotSpeed = 0.003 * (state.frequency / 528);
        if (this.planetMesh) this.planetMesh.rotation.y += rotSpeed;
        if (this.atmosphereMesh) this.atmosphereMesh.rotation.y += rotSpeed * 1.1;

        // Pulse atmosphere scale with vocal alignment / coherence
        const pulse = 1.12 + Math.sin(Date.now() * 0.002) * (state.coherence / 2000);
        if (this.atmosphereMesh) this.atmosphereMesh.scale.set(pulse, pulse, pulse);

        this.renderer.render(this.scene, this.camera);
    }
};

// Hook Planet Observer lazy initialization to Tab click
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetTab = e.target.getAttribute('data-tab');
        if (targetTab === 'planet') {
            setTimeout(() => planetObserver.init(), 50);
        }
    });
});

// --- POPUP SECTION WINDOW MANAGER ---
document.querySelectorAll('.hover-expand-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const popupType = e.currentTarget.getAttribute('data-popup');
        openSectionPopup(popupType);
    });
});

function openSectionPopup(type) {
    const existingModal = document.querySelector('.onyx-modal-overlay');
    if (existingModal) existingModal.remove();

    const overlay = document.createElement('div');
    overlay.className = 'onyx-modal-overlay';

    const frame = document.createElement('div');
    frame.className = 'onyx-modal-frame';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'onyx-modal-close';
    closeBtn.innerHTML = '✕';
    closeBtn.addEventListener('click', () => overlay.remove());

    let contentHtml = '';
    if (type === 'thought') {
        const sourceElem = document.getElementById('section-thought');
        contentHtml = `
            <h2 class="section-title" style="margin-bottom:1rem;"><span class="number">01</span> Thought (Intention Engine Window)</h2>
            <p class="section-desc" style="margin-bottom:1.5rem;">Consciousness acts as a physical force filter upon quantum wave functions.</p>
            ${sourceElem ? sourceElem.innerHTML : ''}
        `;
    } else if (type === 'frequency') {
        const sourceElem = document.getElementById('section-frequency');
        contentHtml = `
            <h2 class="section-title" style="margin-bottom:1rem;"><span class="number">02</span> Frequency (Vibrational Input Window)</h2>
            <p class="section-desc" style="margin-bottom:1.5rem;">Acoustical wave excitation and real-time Solfeggio resonance controls.</p>
            ${sourceElem ? sourceElem.innerHTML : ''}
        `;
    } else if (type === 'matter') {
        const sourceElem = document.getElementById('section-matter');
        contentHtml = `
            <h2 class="section-title" style="margin-bottom:1rem;"><span class="number">03</span> Matter (Cymatics & Physics Window)</h2>
            <p class="section-desc" style="margin-bottom:1.5rem;">Mathematical Chladni plate dynamics & vibrational energy balance.</p>
            ${sourceElem ? sourceElem.innerHTML : ''}
        `;
    }

    frame.innerHTML = contentHtml;
    frame.appendChild(closeBtn);
    
    // Remove duplicate header buttons inside modal copy
    frame.querySelectorAll('.hover-expand-btn').forEach(b => b.remove());

    overlay.appendChild(frame);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

// --- COSMIC STARFIELD BACKGROUND ---
const starfield = {
    stars: [],
    ctx: null,
    w: 0,
    h: 0,
    ready: false
};

function initStarfield() {
    const canvas = el.starfieldCanvas;
    if (!canvas) return;
    
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    starfield.w = window.innerWidth;
    starfield.h = window.innerHeight;
    canvas.width = starfield.w * dpr;
    canvas.height = starfield.h * dpr;
    canvas.style.width = `${starfield.w}px`;
    canvas.style.height = `${starfield.h}px`;
    
    starfield.ctx = canvas.getContext('2d');
    starfield.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    const count = Math.min(220, Math.floor((starfield.w * starfield.h) / 9000));
    starfield.stars = [];
    for (let i = 0; i < count; i++) {
        starfield.stars.push({
            x: Math.random() * starfield.w,
            y: Math.random() * starfield.h,
            r: Math.random() * 1.4 + 0.2,
            a: Math.random() * 0.6 + 0.15,
            tw: Math.random() * Math.PI * 2,
            sp: 0.008 + Math.random() * 0.02
        });
    }
    starfield.ready = true;
    
    window.addEventListener('resize', () => {
        starfield.w = window.innerWidth;
        starfield.h = window.innerHeight;
        canvas.width = starfield.w * dpr;
        canvas.height = starfield.h * dpr;
        canvas.style.width = `${starfield.w}px`;
        canvas.style.height = `${starfield.h}px`;
        starfield.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        for (const s of starfield.stars) {
            s.x = Math.random() * starfield.w;
            s.y = Math.random() * starfield.h;
        }
    });
}

function drawStarfield() {
    if (!starfield.ready) return;
    const ctx = starfield.ctx;
    ctx.clearRect(0, 0, starfield.w, starfield.h);
    
    const boost = state.genesisActive ? 1.4 : 1;
    for (const s of starfield.stars) {
        s.tw += s.sp;
        const flicker = 0.55 + Math.sin(s.tw) * 0.45;
        ctx.beginPath();
        ctx.fillStyle = `rgba(220, 230, 255, ${s.a * flicker * boost})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
    }
}

// --- BOOTSTRAP ---
window.onload = init;
