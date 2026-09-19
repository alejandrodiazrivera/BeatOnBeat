# 🎵 OnBeat - Tone.js Auto-Sync Implementation

## 🎯 Auto-Sync Features

The new Tone.js-powered auto-sync system provides professional-grade metronome synchronization with video content through a single button click.

### ✨ Key Features

#### 1. **One-Click Auto-Sync** 🔒
- **Lock/Unlock Button**: Click the lock icon in metronome controls
- **Automatic Setup**: Initializes Tone.js audio analysis and connects to video
- **Real-time Sync**: Metronome automatically syncs with video playback

#### 2. **Advanced BPM Detection** 🎯
- **Intelligent Analysis**: Uses Tone.js for precise audio frequency analysis  
- **Beat Recognition**: Detects beats in bass frequencies where rhythm is prominent
- **Smart Interpretation**: Automatically determines if detected tempo represents whole notes, half notes, quarter notes, etc.
- **YouTube Support**: Works with both YouTube videos and local video files

#### 3. **Beatgrid Generation** 📊
- **Time-Based Grid**: Creates precise beat positions based on detected/set BPM
- **Pattern Awareness**: Supports 8-beat and Flamenco 12-beat patterns
- **Strong Beat Emphasis**: Differentiates between strong and weak beats

#### 4. **Phase Alignment** ⚡
- **Precision Sync**: Aligns metronome beats with video timing
- **Sub-beat Accuracy**: Handles fractional beat positions for perfect timing
- **Drift Correction**: Automatically corrects timing drift during playback

#### 5. **Tempo Control** 🎛️
- **Speed Up/Down**: Adjust tempo in 5 BPM increments
- **Match Video**: Automatically match detected BPM from video
- **Real-time Updates**: Changes apply immediately with smooth transitions

## 🚀 How to Use

### Basic Operation

1. **Load a Video**: Paste YouTube URL or load local video file
2. **Start Playback**: Play the video to hear the music
3. **Enable Auto-Sync**: Click the lock button (🔒) in metronome controls
4. **Automatic Detection**: The system will:
   - Initialize Tone.js audio analysis
   - Connect to video audio stream
   - Start metronome with current BPM
   - Display auto-sync control panel

### Auto-Sync Panel Controls

When auto-sync is active, you'll see a control panel with:

- **🎯 Auto-Detect BPM**: Analyzes video audio to detect tempo
- **⚡ Speed Up (+5)**: Increase tempo by 5 BPM
- **🐌 Slow Down (-5)**: Decrease tempo by 5 BPM  
- **🎯 Match Video**: Set metronome to detected BPM

### Advanced Features

#### BPM Detection Process
1. **Audio Analysis**: 8-second analysis window using FFT
2. **Beat Detection**: Identifies energy spikes in bass frequencies
3. **Interval Calculation**: Measures time between detected beats
4. **Smart Interpretation**: Determines correct note value representation
5. **Range Validation**: Ensures BPM is within musical range (60-200)

#### Sync Monitoring
- **Real-time Tracking**: Monitors video time vs. metronome beat position
- **Drift Correction**: Automatically adjusts when sync drifts > 0.1 beats
- **Phase Alignment**: Maintains precise timing relationships

## 🎛️ Technical Implementation

### Tone.js Integration
- **Audio Context**: Professional-grade Web Audio API through Tone.js
- **Precise Timing**: Uses Tone.Transport for sample-accurate scheduling
- **Advanced Synthesis**: High-quality metronome click synthesis
- **Low Latency**: Minimal delay between video and metronome

### Beat Detection Algorithm
```javascript
// Simplified algorithm overview:
1. Analyze audio frequencies using FFT
2. Focus on bass range (lower 10% of spectrum)  
3. Detect energy spikes above threshold
4. Calculate intervals between spikes
5. Apply intelligent BPM interpretation
6. Validate and clamp to musical range
```

### Sync Calculation
```javascript
// Phase alignment calculation:
beatPosition = (videoTime / beatInterval) % beatsPerCycle
targetPosition = targetBeat - 1  
phase = (targetPosition - beatPosition) * beatInterval
```

## 🎵 Supported Patterns

### 8-Beat Pattern
- **Strong Beats**: 1, 5
- **Weak Beats**: 2, 3, 4, 6, 7, 8
- **Use Case**: Pop, rock, most modern music

### Flamenco 12-Beat (Compás)
- **Strong Beats**: 1, 4, 7, 10
- **Weak Beats**: 2, 3, 5, 6, 8, 9, 11, 12
- **Use Case**: Flamenco, some Latin rhythms

## 🔧 Troubleshooting

### Common Issues

**Auto-sync not working:**
- Ensure video has audio content
- Check browser audio permissions
- Try clicking the page first (Chrome requires user interaction)

**BPM detection inaccurate:**
- Use manual tempo adjustment buttons
- Ensure video has clear rhythmic content
- Try the "Match Video" button after detection

**Metronome not syncing:**
- Check that video is playing
- Ensure auto-sync is locked (🔒 button active)
- Try unlocking and re-locking auto-sync

### Browser Compatibility
- **Chrome**: Full support with hardware acceleration
- **Firefox**: Good support, may have slight latency
- **Safari**: Basic support, some features limited
- **Edge**: Full support similar to Chrome

## 🎯 Best Practices

1. **Clear Audio**: Use videos with prominent rhythmic content
2. **Stable Tempo**: Works best with consistent tempo music
3. **User Interaction**: Click page before using auto-sync (browser requirement)
4. **Monitor Sync**: Watch the beat indicator for visual confirmation
5. **Manual Override**: Use tempo controls if auto-detection needs adjustment

## 🔜 Future Enhancements

- **Machine Learning**: AI-powered rhythm recognition
- **Multiple Time Signatures**: Support for complex meters
- **MIDI Integration**: External controller support  
- **Advanced Visualization**: Waveform display with beat markers
- **Export Functions**: Save sync data for later use
