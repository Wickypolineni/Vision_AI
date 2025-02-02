# Moondream Vision App

A Flask-based web application that integrates the **Moondream Vision Language Model** to analyze images and provide textual descriptions. Users can upload images, ask questions, and receive detailed responses.

## Features

- **Live Webcam Feed**: Capture images directly from your webcam.
- **Speech-to-Text**: Use the Web Speech API to input prompts via voice.
- **Moondream Integration**: Analyze images and generate detailed descriptions.
- **Mobile-Friendly**: Responsive design for seamless use on mobile devices.

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Wickypolineni/Vision_AI_.git
cd Vision_AI
```

### 2. Set Up a Virtual Environment
```bash
python -m venv myenv
source myenv/bin/activate  # On Windows: myenv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables
Create a `.env` file in the root directory and add:
```plaintext
MOONDREAM_API_KEY=your_api_key_here
```

### 5. Run the App
```bash
python app.py
```

### 6. Access the App
Open your browser and go to [http://127.0.0.1:5000](http://127.0.0.1:5000).

## Usage

### Start the Camera
Click **"Start Camera"** to begin the webcam feed.

### Ask Moondream
- Enter a prompt in the text box or use the **"Speak"** button for voice input.
- Click **"Ask Moondream"** to analyze the image and get a response.

### Stop the Camera
Click **"Stop Camera"** to end the webcam feed.

---
**Happy Coding! 🚀**

