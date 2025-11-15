from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import torch
from transformers import CLIPProcessor, CLIPModel
import os

app = Flask(__name__)
CORS(app)

# Global variables for model
model = None
processor = None
MODEL_LOADED = False

# Predefined categories for classification
CATEGORIES = [
    "people", "animals", "nature", "urban", "food", "indoor", 
    "outdoor", "sports", "technology", "vehicles", "architecture",
    "art", "documents", "abstract", "pets", "landscape",
    "portrait", "wildlife", "city", "building", "transportation"
]

def load_model():
    """Load CLIP model on startup"""
    global model, processor, MODEL_LOADED
    
    try:
        print("🤖 Loading CLIP model...")
        model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        MODEL_LOADED = True
        print("✅ CLIP model loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading CLIP model: {e}")
        print("⚠️  Running in fallback mode")
        MODEL_LOADED = False

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model": "CLIP" if MODEL_LOADED else "Fallback",
        "model_loaded": MODEL_LOADED
    })

@app.route('/classify', methods=['POST'])
def classify_image():
    """
    Accepts image file, returns AI-generated tags
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
    
    try:
        # Read image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        print(f"📸 Processing image: {file.filename} ({image.size})")
        
        # Classify with CLIP or fallback
        if MODEL_LOADED:
            tags = classify_with_clip(image)
            confidence = "high"
        else:
            tags = fallback_classification(file.filename)
            confidence = "low"
        
        # Generate category path
        category = generate_category_path(tags)
        
        print(f"✅ Tags: {tags}, Category: {category}")
        
        return jsonify({
            "tags": tags,
            "category": category,
            "confidence": confidence,
            "model": "CLIP" if MODEL_LOADED else "Fallback"
        })
    
    except Exception as e:
        print(f"❌ Error processing image: {e}")
        return jsonify({"error": str(e)}), 500

def classify_with_clip(image):
    """
    Use CLIP model to classify image against predefined categories
    """
    try:
        inputs = processor(
            text=CATEGORIES, 
            images=image, 
            return_tensors="pt", 
            padding=True
        )
        
        with torch.no_grad():
            outputs = model(**inputs)
            logits_per_image = outputs.logits_per_image
            probs = logits_per_image.softmax(dim=1)
        
        # Get top 3 categories
        top_probs, top_indices = probs[0].topk(3)
        
        tags = []
        for idx, prob in zip(top_indices.tolist(), top_probs.tolist()):
            if prob > 0.1:  # Only include if confidence > 10%
                tags.append(CATEGORIES[idx])
        
        # Ensure at least 2 tags
        if len(tags) < 2:
            tags = [CATEGORIES[i] for i in top_indices.tolist()[:2]]
        
        return tags[:3]  # Return max 3 tags
        
    except Exception as e:
        print(f"⚠️  CLIP classification error: {e}")
        return fallback_classification("unknown.jpg")

def fallback_classification(filename):
    """
    Simple fallback classification based on filename
    """
    filename_lower = filename.lower()
    
    # Simple keyword matching
    keywords = {
        'dog': ['animals', 'pets', 'outdoor'],
        'cat': ['animals', 'pets', 'indoor'],
        'car': ['vehicles', 'transportation', 'urban'],
        'food': ['food', 'indoor', 'art'],
        'nature': ['nature', 'outdoor', 'landscape'],
        'city': ['urban', 'architecture', 'outdoor'],
        'people': ['people', 'portrait', 'outdoor'],
        'building': ['architecture', 'urban', 'outdoor'],
        'beach': ['nature', 'outdoor', 'landscape'],
        'mountain': ['nature', 'landscape', 'outdoor'],
        'selfie': ['people', 'portrait', 'indoor'],
        'sunset': ['nature', 'outdoor', 'landscape'],
        'street': ['urban', 'outdoor', 'architecture']
    }
    
    # Check for keywords in filename
    for keyword, tags in keywords.items():
        if keyword in filename_lower:
            return tags[:3]
    
    # Default tags
    return ['abstract', 'general', 'art']

def generate_category_path(tags):
    """
    Create folder path from tags
    Examples: 
    - ["animals", "outdoor"] -> "Animals/Outdoor"
    - ["people", "indoor"] -> "People/Indoor"
    """
    if not tags or len(tags) == 0:
        return "Uncategorized/General"
    
    primary = tags[0].capitalize()
    secondary = tags[1].capitalize() if len(tags) > 1 else "General"
    
    return f"{primary}/{secondary}"

# Initialize model on startup
load_model()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"🚀 Starting AI Service on port {port}")
    print(f"📊 Categories available: {len(CATEGORIES)}")
    app.run(host='0.0.0.0', port=port, debug=True)