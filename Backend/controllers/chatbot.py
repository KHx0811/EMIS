from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
from google.api_core import retry

app = Flask(__name__)
CORS(app)

# Retry logic for handling API rate limits or temporary unavailability
is_retriable = lambda e: (isinstance(e, genai.errors.APIError) and e.code in {429, 503})
genai.models.Models.generate_content = retry.Retry(predicate=is_retriable)(genai.models.Models.generate_content)

# Initialize the GenAI client
GOOGLE_API_KEY = "AIzaSyAi13LAvTN2SQBpHwg-uqDUyOGpUDslDNA"  # Replace with your actual API key
client = genai.Client(api_key=GOOGLE_API_KEY)

# Dictionary to store conversation history by conversation ID
conversations = {}

# Role-based operations
role_operations = {
    'admin': [
        "create, read, update, delete users (students, parents, teachers, principals, district heads)",
        "full access to all data and operations"
    ],
    'parent': [
        "view child data (attendance, marks, fees, extracurricular activities)"
    ],
    'teacher': [
        "create classes, add students to classes within the same school",
        "read student and parent details",
        "upload marks, attendance, register students for events/sports",
        "apply for leave, arrange parent-teacher interactions"
    ],
    'principal': [
        "monitor all classes, teachers, and students in the school",
        "conduct events, allocate budgets, fix fees for classes",
        "schedule meetings with the district head"
    ],
    'districthead': [
        "monitor all schools within the district",
        "allocate budgets for schools, attend council meetings",
        "record school progress and assess school fitness"
    ]
}

# Check if message is a simple greeting
def is_simple_greeting(message):
    greetings = ['hi', 'hello', 'hey', 'hii', 'hiii', 'hiiii', 'greetings', 'howdy', 'good morning', 
                'good afternoon', 'good evening', 'good day']
    return message.lower().strip() in greetings

# Get appropriate greeting response based on user type
def get_greeting_response(user_type):
    if not user_type or user_type.lower() == 'guest':
        return "Hello! Please log in to access personalized assistance. How can I help you today?"
    
    role_specific_response = {
        'admin': "Hello, admin! I can help you manage users, monitor activities, or generate reports. What would you like to do?",
        'parent': "Hello! I can help you check your child's progress, fees, or attendance. What would you like to know?",
        'teacher': "Hi there! I can assist you with creating classes, uploading marks, or tracking attendance. How can I help you today?",
        'principal': "Hello, Principal! I can help you monitor school activities, allocate budgets, or schedule meetings. What do you need?",
        'districthead': "Hello! I can assist you with overseeing schools, allocating funds, or accessing district reports. How may I help you?"
    }
    
    return role_specific_response.get(user_type.lower(), "Hello! How can I assist you today?")

def clean_response(response_text):
    """Clean up the response text to remove markdown and reasoning patterns"""
    # Remove markdown code blocks
    response_text = response_text.replace("```", "")
    
    # Remove numbered reasoning steps
    import re
    response_text = re.sub(r'\d+\.\s+\*\*.*?\*\*:', '', response_text)
    response_text = re.sub(r'\*\*.*?\*\*', '', response_text)
    
    # Remove "Here's my reasoning and response:" pattern
    response_text = re.sub(r"Here's my reasoning and response:.*?(?=\w)", '', response_text, flags=re.DOTALL)
    
    # Remove any explicit reasoning patterns
    response_text = re.sub(r'As a helpful AI assistant.*?(?=\w)', '', response_text, flags=re.DOTALL)
    
    # Replace multiple newlines with a single one
    response_text = re.sub(r'\n\s*\n', '\n', response_text)
    
    return response_text.strip()


# Function to call Google Gemini 2.0 Flash model API with memory
def gemini_flash_model_response(message, user_type=None, conversation_id=None):
    # Get or create conversation history for this conversation ID
    if not conversation_id:
        conversation_id = f"default_{user_type}"
    
    if conversation_id not in conversations:
        conversations[conversation_id] = []
    
    chat_history = conversations[conversation_id]
    
    # Special case for simple greetings
    if is_simple_greeting(message):
        response_text = get_greeting_response(user_type)
        
        chat_history.append({"role": "user", "content": message})
        chat_history.append({"role": "assistant", "content": response_text})
        return response_text

    # Add user message to history
    chat_history.append({"role": "user", "content": message})

    # If chat history exceeds limit, trim it
    if len(chat_history) > 10:
        # Keep the first message (could be system) and the last 9 messages
        chat_history = chat_history[:1] + chat_history[-9:]

    # Prepare full conversation history
    conversation = "\n".join([f"{entry['role'].capitalize()}: {entry['content']}" for entry in chat_history])

    # Prompt construction with role-specific context - UPDATED PROMPT
    prompt = f"""
    You are an AI assistant for an education management system. The user is a {user_type or 'guest'}.
    
    Here's what {user_type or 'guest'} users can do in this system:
    {role_operations.get(user_type.lower(), ['Limited access until login'])}
    
    IMPORTANT INSTRUCTIONS:
    1. NEVER mention searching databases, fetching data, or retrieving information.
    2. Instead, directly tell users what they can or cannot access based on their role.
    3. If a user asks about accessing information they don't have permission for, simply state they don't have access to that information due to their role.
    4. If a user asks about a specific person or data, don't say you're "fetching" or "searching" - just explain what they can see based on their permissions.
    
    Give ONLY the direct response to the user's query without any explanation of your reasoning.
    Keep responses concise (2-3 sentences maximum) and natural sounding.
    DO NOT include markdown formatting, numbered steps, or reasoning steps in your response.
    
    Conversation:
    {conversation}
    """

    try:
        # Send the prompt to Gemini 2.0 Flash model
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        # Clean the response text
        response_text = clean_response(response.text)
        
        chat_history.append({"role": "assistant", "content": response_text})
        return response_text
    except Exception as e:
        return f"I'm having trouble processing your request. Please try again."

# Generate response based on user role and message
def generate_response(message, user_type=None, conversation_id=None):
    if not message:
        return {"response": "Please provide a message.", "link": "/help"}

    # Use Gemini model to analyze the query
    model_response = gemini_flash_model_response(message, user_type, conversation_id)

    return {
        'response': model_response,
        'link': f"/dashboard/{user_type.lower()}" if user_type else "/help",
        'conversationId': conversation_id
    }

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')
    user_type = data.get('userType', 'guest')
    conversation_id = data.get('conversationId')
    
    # Ensure user_type is not empty
    if not user_type or user_type == '':
        user_type = 'guest'
    
    # Get response from AI model
    response_data = generate_response(message, user_type, conversation_id)

    return jsonify({
        'message': message,
        'userType': user_type,
        'response': response_data['response'],
        'link': response_data.get('link', None),
        'conversationId': response_data.get('conversationId', conversation_id)
    })

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)