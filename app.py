from flask import Flask, render_template, request, jsonify
import base64
import os
from datetime import datetime
import moondream as md
from PIL import Image
import io
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)

# Read Moondream API key from environment variable
MOONDREAM_API_KEY = os.getenv("MOONDREAM_API_KEY")
if not MOONDREAM_API_KEY:
    raise ValueError("Moondream API key not found in environment variables.")

# Initialize Moondream model
model = md.vl(api_key=MOONDREAM_API_KEY)

# Ensure the uploads directory exists
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    try:
        data = request.json
        image_data = data.get("image")
        prompt = data.get("prompt")

        if not image_data or not prompt:
            return jsonify({"error": "Image data or prompt missing"}), 400

        # Decode the base64 image
        img_data = base64.b64decode(image_data.split(",")[1])
        image = Image.open(io.BytesIO(img_data))

        # Encode the image for Moondream
        encoded_image = model.encode_image(image)

        # Generate a response using Moondream
        response = model.query(encoded_image, prompt)["answer"]

        # Save the image with a timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"capture_{timestamp}.jpg"
        filepath = os.path.join(UPLOAD_DIR, filename)
        image.save(filepath)

        return jsonify({"response": response, "image_url": filepath}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)