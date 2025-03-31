from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Mock function to simulate Gemini 2.0 Flash model integration
def gemini_flash_model_response(message, user_type=None):
    return f"Gemini 2.0 Flash model processed your query: '{message}' for user type: '{user_type}'"

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

# Generate response based on user role and message
def generate_response(message, user_type=None):
    lower_message = message.lower()
    few_shot_examples = {
        'admin': [
            "As an admin, you can manage users by creating, reading, updating, or deleting their information. For example, you can add a new teacher or update a student's details.",
            "Admins have full access to all data and operations. For instance, you can monitor system-wide activity or generate reports."
        ],
        'parent': [
            "As a parent, you can view your child's attendance, marks, fees, and extracurricular activities. For example, you can check if your child has completed their fee payment.",
            "Parents can also monitor their child's progress and communicate with teachers through the dashboard."
        ],
        'teacher': [
            "As a teacher, you can create classes, add students, upload marks, and track attendance. For example, you can register a student for a sports event.",
            "Teachers can also arrange parent-teacher interactions or apply for leave through the dashboard."
        ],
        'principal': [
            "As a principal, you can monitor all classes, teachers, and students in your school. For example, you can allocate budgets for school development.",
            "Principals can also conduct events, fix class fees, and schedule meetings with district heads."
        ],
        'districthead': [
            "As a district head, you can monitor all schools in your district. For example, you can allocate budgets to schools or assess their performance.",
            "District heads can also attend council meetings and record school progress for fitness assessments."
        ]
    }
    if user_type and user_type.lower() in role_operations:
        for operation in role_operations[user_type.lower()]:
            if any(keyword in lower_message for keyword in operation.split(", ")):
                return {
                    'response': (
                        f"As a {user_type}, you can perform the following operation: {operation}. "
                        f"To proceed, visit your dashboard at /dashboard/{user_type.lower()} and navigate to the relevant section. "
                        f"Here are some examples to guide you:\n- {few_shot_examples[user_type.lower()][0]}\n- {few_shot_examples[user_type.lower()][1]}"
                    ),
                    'link': f"/dashboard/{user_type.lower()}"
                }
    if 'contact admin' in lower_message or 'support' in lower_message:
        return {
            'response': (
                "You can contact the admin through the contact-admin form in your dashboard. "
                "If you need immediate assistance, please email support@example.com or call our helpline at +1-800-123-4567."
            ),
            'link': "/contact-admin"
        }
    return {
        'response': (
            "I'm sorry, I couldn't understand your request. Here are some suggestions to help you: "
            "1. Check your spelling or rephrase your query. "
            "2. Visit the help section at /help for detailed guidance. "
            "3. Contact support if you need further assistance."
        ),
        'link': "/help"
    }

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')
    user_type = data.get('userType', None)
    print(f"User Type: {user_type}, Message: {message}")  # Debugging logs

    # Get the response from generate_response
    response_data = generate_response(message, user_type)

    # Return the entire payload including the original message, userType, and response
    return jsonify({
        'message': message,
        'userType': user_type,
        'response': response_data['response'],
        'link': response_data.get('link', None)  # Include link if available
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
    
    