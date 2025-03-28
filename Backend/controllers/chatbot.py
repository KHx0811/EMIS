from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def generate_response(message, user_type=None):
    lower_message = message.lower()
    
    common_responses = [
        {
            'keywords': ['hii','hello','hey','help', 'support', 'assistance', 'how can i', 'what to do'],
            'response': "I'm here to help! What specific information do you need? Please specify your role or login for the exact assistance you require.",
            'link': "/selectuser"
        },
        {
            'keywords': ['login', 'access', 'dashboard'],
            'response': "Depending on your role, you can access different dashboards. Could you specify if you're a parent, teacher, principal, or admin?",
            'link': "/selectuser"
        }
    ]

    universal_responses = [
        {
            'keywords': ['password', 'reset', 'forgot'],
            'response': "To reset your password, please use the 'Forgot Password' option on the login page or contact system administrator.",
            'link': "/getresetpasswordotp"
        },
        {
            'keywords': ['contact', 'support', 'administrator', 'admin'],
            'response': "For direct support, please contact the system administrator through the contact section in your respective dashboard.",
            'link': "/selectuser"
        }
    ]

    user_type_responses = {
        'parent': [
            {
                'keywords': ['edit', 'change', 'update', 'wrong', 'data', 'child'],
                'response': "To edit your child's information, go to the Parent Dashboard and use the 'Edit Profile' section or contact the administrator.",
                'link': "/dashboard/parent"
            },
            {
                'keywords': ['grades', 'performance', 'marks', 'score'],
                'response': "You can view your child's academic performance in the Parent Dashboard under the 'Academic Progress' section.",
                'link': "/dashboard/parent"
            }
        ],
        'teacher': [
            {
                'keywords': ['attendance', 'record', 'students', 'mark'],
                'response': "Manage student attendance through the Teacher Dashboard in the 'Attendance Management' section.",
                'link': "/dashboard/teacher"
            },
            {
                'keywords': ['assignment', 'homework', 'submit', 'upload'],
                'response': "Submit and track student assignments using the Assignments module in your Teacher Dashboard.",
                'link': "/dashboard/teacher"
            }
        ],
        'principal': [
            {
                'keywords': ['school', 'report', 'overview', 'statistics'],
                'response': "Access comprehensive school reports and analytics in the Principal Dashboard.",
                'link': "/dashboard/principal"
            }
        ],
        'admin': [
            {
                'keywords': ['user', 'management', 'create', 'delete', 'account'],
                'response': "Manage users, create accounts, and handle system configurations in the Admin Dashboard.",
                'link': "/dashboard/admin"
            }
        ]
    }

    def find_matching_response(response_list):
        for response in response_list:
            if any(keyword in lower_message for keyword in response['keywords']):
                return response
        return None

    if user_type and user_type.lower() in user_type_responses:
        specific_response = find_matching_response(user_type_responses[user_type.lower()])
        if specific_response:
            return specific_response

    universal_response = find_matching_response(universal_responses)
    if universal_response:
        return universal_response

    common_response = find_matching_response(common_responses)
    if common_response:
        return common_response

    return {
        'response': "I'm unable to understand your specific query. Could you provide more details or specify your user role? Options include: Parent, Teacher, Principal, or Admin.",
        'link': "/selectuser"
    }

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    user_type = data.get('userType')

    if not message:
        return jsonify({'error': 'No message provided'}), 400

    ai_response = generate_response(message, user_type)

    return jsonify({
        'response': ai_response['response'],
        'link': ai_response['link']
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)