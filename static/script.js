const video = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const cameraSelect = document.getElementById("cameraSelect");
const startCameraButton = document.getElementById("startCamera");
const stopCameraButton = document.getElementById("stopCamera");
const askButton = document.getElementById("ask");
const speakButton = document.getElementById("speak");
const promptInput = document.getElementById("prompt");
const responseElement = document.getElementById("response");
const statusElement = document.getElementById("status");
const context = canvas.getContext("2d");

let currentStream = null;
let recognition = null;
let isSpeaking = false;

// Initialize camera handling
async function initializeCamera() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === "videoinput");
        
        // Populate camera selection dropdown
        videoDevices.forEach(device => {
            const option = document.createElement("option");
            option.value = device.deviceId;
            option.text = device.label || `Camera ${cameraSelect.options.length + 1}`;
            cameraSelect.add(option);
        });
        
        // Set initial state
        updateButtonStates(false);
        statusElement.textContent = "Camera ready to start";
    } catch (error) {
        console.error("Error initializing camera:", error);
        statusElement.textContent = "Error accessing camera";
    }
}

// Handle camera switching and starting
async function startCamera(deviceId) {
    try {
        // Stop any existing stream
        await stopCamera();
        
        // Start new stream with highest possible quality
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: deviceId,
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: 60 }
            }
        });
        
        video.srcObject = stream;
        currentStream = stream;
        
        // Set canvas dimensions to match video
        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        });

        updateButtonStates(true);
        statusElement.textContent = "Camera started";
    } catch (error) {
        console.error("Error starting camera:", error);
        statusElement.textContent = "Error starting camera";
        updateButtonStates(false);
    }
}

// Stop camera stream
async function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        currentStream = null;
        updateButtonStates(false);
        statusElement.textContent = "Camera stopped";
    }
}

// Update button states based on camera status
function updateButtonStates(isCameraRunning) {
    startCameraButton.disabled = isCameraRunning;
    stopCameraButton.disabled = !isCameraRunning;
    askButton.disabled = !isCameraRunning;
    speakButton.disabled = !isCameraRunning;
    cameraSelect.disabled = isCameraRunning;
}

// Capture and send image with prompt
async function askMoondream() {
    try {
        if (!currentStream) {
            statusElement.textContent = "Please start the camera first";
            return;
        }

        const prompt = promptInput.value.trim();
        if (!prompt) {
            statusElement.textContent = "Please enter a prompt";
            return;
        }

        // Show loading message
        responseElement.innerText = "Loading, please wait...";

        // Create a temporary canvas for capturing
        const captureCanvas = document.createElement('canvas');
        captureCanvas.width = video.videoWidth;
        captureCanvas.height = video.videoHeight;
        const captureContext = captureCanvas.getContext('2d');

        // Draw current frame to the temporary canvas
        captureContext.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
        const imageDataURL = captureCanvas.toDataURL("image/jpeg", 1.0);
        
        // Send to server
        const response = await fetch("/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: imageDataURL, prompt: prompt }),
        });
        
        if (response.ok) {
            const data = await response.json();
            responseElement.innerText = data.response;  // Display Moondream's response
            statusElement.textContent = "Image captured and analyzed successfully";
        } else {
            throw new Error("Server error");
        }
    } catch (error) {
        console.error("Error capturing image:", error);
        responseElement.innerText = "Error: Unable to process the request.";
        statusElement.textContent = "Error capturing image";
    }
}

// Initialize Web Speech API
function initializeSpeechRecognition() {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false; // Stop after one sentence
    recognition.interimResults = true; // Show interim results
    recognition.lang = "en-US"; // Set language

    recognition.onstart = () => {
        isSpeaking = true;
        speakButton.textContent = "Stop";
        statusElement.textContent = "Listening...";
    };

    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
        promptInput.value = transcript;
    };

    recognition.onend = () => {
        isSpeaking = false;
        speakButton.textContent = "Speak";
        statusElement.textContent = "Speech recognition stopped";
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        statusElement.textContent = "Error: " + event.error;
    };
}

// Toggle speech recognition
function toggleSpeechRecognition() {
    if (!recognition) {
        initializeSpeechRecognition();
    }

    if (isSpeaking) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

// Event listeners
cameraSelect.addEventListener("change", () => {
    if (currentStream) {
        startCamera(cameraSelect.value);
    }
});
startCameraButton.addEventListener("click", () => startCamera(cameraSelect.value));
stopCameraButton.addEventListener("click", stopCamera);
askButton.addEventListener("click", askMoondream);
speakButton.addEventListener("click", toggleSpeechRecognition);

// Initialize on load
initializeCamera();