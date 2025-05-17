from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
from google.api_core import retry
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app, origins=["https://emis-ebon.vercel.app"])

# Retry logic for handling API rate limits or temporary unavailability
is_retriable = lambda e: (isinstance(e, genai.errors.APIError) and e.code in {429, 503})
genai.models.Models.generate_content = retry.Retry(predicate=is_retriable)(
    genai.models.Models.generate_content
)

# Initialize the GenAI client
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=GOOGLE_API_KEY)

# Dictionary to store conversation history by conversation ID
conversations = {}

# Role-based operations
role_operations = {
    "admin": [
        "create, read, update, delete users (students, parents, teachers, principals, district heads)",
        "full access to all data and operations",
    ],
    "parent": ["view child data (attendance, marks, fees, extracurricular activities)"],
    "teacher": [
        "create classes, add students to classes within the same school",
        "read student and parent details",
        "upload marks, attendance, register students for events/sports",
        "apply for leave, arrange parent-teacher interactions",
    ],
    "principal": [
        "monitor all classes, teachers, and students in the school",
        "conduct events, allocate budgets, fix fees for classes",
        "schedule meetings with the district head",
    ],
    "districthead": [
        "monitor all schools within the district",
        "allocate budgets for schools, attend council meetings",
        "record school progress and assess school fitness",
    ],
}

# Links for different features and user types
feature_links = {
    "login": {
        "admin": "/login/admin",
        "parent": "/login/parent",
        "teacher": "/login/teacher",
        "principal": "/login/principal",
        "districthead": "/login/district",
        "default": "/selectuser",
    },
    "dashboard": {
        "parent": "/dashboard/parent",
        "teacher": "/dashboard/teacher",
        "principal": "/dashboard/principal",
        "districthead": "/dashboard/districthead",
        "admin": "/dashboard/admin",
        "default": "/login",
    },
    "parent": {
        "child_profile": "/dashboard/parent/childProfile",
        "attendance": "/dashboard/parent/Attendance",
        "marks": "/dashboard/parent/Marks",
        "events": "/dashboard/parent/Events",
        "fees": "/dashboard/parent/Fees",
        "profile": "/dashboard/parent/profile",
        "parent_teacher_meeting": "/dashboard/parent/PT Meetings",
        "contact_admin": "/dashboard/parent/contactAdmin",
        "teachers": "/dashboard/parent/Teachers",
    },
    "teacher": {
        "classes": "/dashboard/teacher/classes",
        "attendance": "/dashboard/teacher/attendance",
        "marks": "/dashboard/teacher/marks",
        "events": "/dashboard/teacher/events",
        "leave": "/dashboard/teacher/leave",
        "profile": "/dashboard/teacher/profile",
        "search_student": "/dashboard/teacher/search student",
        "parent_teacher_meeting": "/dashboard/teacher/parentInteraction",
        "contact_admin": "/dashboard/teacher/Contact Admin",
    },
    "principal": {
        "search_student": "/dashboard/principal/studentSearch",
        "search_teacher": "/dashboard/principal/teacherSearch",
        "school_fees": "/dashboard/principal/schoolFees",
        "budget": "/dashboard/principal/budgetUsage",
        "events": "/dashboard/principal/events",
        "meetings": "/dashboard/principal/meetings",
        "leave_approvals": "/dashboard/principal/leaveApprovals",
        "profile": "/dashboard/principal/profile",
        "contact_admin": "/dashboard/principal/contactAdmin",
    },
    "districthead": {
        "search_school": "/dashboard/districthead/schoolSearch",
        "search_teacher": "/dashboard/districthead/teacherSearch",
        "search_student": "/dashboard/districthead/studentSearch",
        "budget": "/dashboard/districthead/budgets",
        "meetings": "/dashboard/districthead/meetings",
        "exams": "/dashboard/districthead/exams",
        "contact_admin": "/dashboard/districthead/contactAdmin",
    },
    "admin": {
        "create_student": "/dashboard/admin/createStudent",
        "create_teacher": "/dashboard/admin/createTeacher",
        "create_school": "/dashboard/admin/createSchool",
        "create_district": "/dashboard/admin/createDistrict",
        "search_student": "/dashboard/admin/studentList",
        "search_teacher": "/dashboard/admin/teacherList",
        "search_school": "/dashboard/admin/schoolList",
        "search_district": "/dashboard/admin/districtList",
        "update_student": "/dashboard/admin/updateStudent",
        "update_teacher": "/dashboard/admin/updateTeacher",
        "update_school": "/dashboard/admin/updateSchool",
        "update_district": "/dashboard/admin/updateDistrict",
        "delete_student": "/dashboard/admin/deleteStudent",
        "delete_teacher": "/dashboard/admin/deleteTeacher",
        "delete_school": "/dashboard/admin/deleteSchool",
        "delete_district": "/dashboard/admin/deleteDistrict",
    },
}


# Function to detect if user is asking about restricted features
def needs_login(message, user_type):
    # If user is guest or not logged in
    if not user_type or user_type.lower() == "guest":
        login_keywords = [
            "attendance",
            "marks",
            "class",
            "student",
            "parent",
            "budget",
            "fee",
            "leave",
            "application",
            "events",
            "meeting",
            "register",
            "upload",
            "create",
            "delete",
            "update",
            "modify",
            "schedule",
            "interaction",
            "profile",
            "details",
            "view",
            "check",
            "access",
            "my",
            "record",
        ]

        # Check if message contains any login keyword
        for keyword in login_keywords:
            if keyword.lower() in message.lower():
                return True

    return False


role_indicators = {
    "admin": [
        "admin",
        "administrator",
        "manage users",
        "create users",
        "delete users",
        "system administrator",
    ],
    "parent": [
        "my child",
        "my kid",
        "children",
        "parent",
        "fee payment",
        "child attendance",
        "my child's grades",
    ],
    "teacher": [
        "teacher",
        "upload marks",
        "attendance",
        "create class",
        "my students",
        "class management",
    ],
    "principal": [
        "principal",
        "school budget",
        "conduct event",
        "school management",
        "approve leave",
    ],
    "districthead": [
        "district",
        "multiple schools",
        "district head",
        "school network",
        "district management",
    ],
}

feature_indicators = {
    "dashboard": ["dashboard", "home", "main page", "overview", "homepage"],
    "child_profile": [
        "child profile",
        "my kid profile",
        "child details",
        "kid details",
    ],
    "search_student": [
        "search student",
        "find student",
        "student search",
        "look up student",
    ],
    "search_teacher": [
        "search teacher",
        "find teacher",
        "teacher search",
        "look up teacher",
    ],
    "search_school": [
        "search school",
        "find school",
        "school search",
        "look up school",
    ],
    "search_district": [
        "search district",
        "find district",
        "district search",
        "look up district",
    ],
    "attendance": ["attendance", "present", "absent", "roll call", "check-in"],
    "marks": [
        "marks",
        "grades",
        "scores",
        "results",
        "performance",
        "academic results",
    ],
    "classes": ["classes", "section", "classroom", "create class", "manage class"],
    "events": [
        "events",
        "activities",
        "functions",
        "programs",
        "register for event",
        "school events",
    ],
    "fees": [
        "fees",
        "payments",
        "dues",
        "pay",
        "money",
        "finance",
        "fee structure",
        "school fees",
    ],
    "leave": ["leave", "absent", "day off", "vacation", "holiday", "leave requests"],
    "budget": [
        "budget",
        "funds",
        "allocate",
        "spending",
        "expenses",
        "money allocation",
    ],
    "meetings": [
        "meetings",
        "appointments",
        "schedule",
        "discussions",
        "parent teacher meeting",
    ],
    "parent_teacher_meeting": [
        "parent teacher meeting",
        "pt meeting",
        "parent conference",
        "teacher meeting",
    ],
    "profile": [
        "profile",
        "account",
        "my details",
        "personal information",
        "user account",
    ],
    "leave_approvals": [
        "leave approvals",
        "approve leave",
        "leave requests",
        "leave management",
    ],
    "school_fees": [
        "school fees",
        "fee structure",
        "payment details",
        "fee collection",
    ],
    "exams": ["exams", "tests", "assessments", "evaluations", "examination schedule"],
    "contact_admin": [
        "contact admin",
        "admin support",
        "help desk",
        "support",
        "admin assistance",
    ],
    "create_student": [
        "create student",
        "add student",
        "new student",
        "register student",
    ],
    "create_teacher": [
        "create teacher",
        "add teacher",
        "new teacher",
        "register teacher",
    ],
    "create_school": ["create school", "add school", "new school", "register school"],
    "create_district": [
        "create district",
        "add district",
        "new district",
        "register district",
    ],
    "update_student": [
        "update student",
        "edit student",
        "modify student",
        "change student details",
    ],
    "update_teacher": [
        "update teacher",
        "edit teacher",
        "modify teacher",
        "change teacher details",
    ],
    "update_school": [
        "update school",
        "edit school",
        "modify school",
        "change school details",
    ],
    "update_district": [
        "update district",
        "edit district",
        "modify district",
        "change district details",
    ],
    "delete_student": ["delete student", "remove student", "deactivate student"],
    "delete_teacher": ["delete teacher", "remove teacher", "deactivate teacher"],
    "delete_school": ["delete school", "remove school", "deactivate school"],
    "delete_district": ["delete district", "remove district", "deactivate district"],
}


# Function to get appropriate feature link based on message context
def get_feature_link(message, user_type):
    # If user is not logged in, return login link
    if not user_type or user_type.lower() == "guest":
        # Try to determine which role the user might be trying to access
        for role, indicators in role_indicators.items():
            for indicator in indicators:
                if indicator.lower() in message.lower():
                    return feature_links["login"].get(
                        role, feature_links["login"]["default"]
                    )

        # Default login link if no specific role is detected
        return feature_links["login"]["default"]

    # For logged-in users, detect which feature they're asking about
    user_type = user_type.lower()

    # Check which feature the user is asking about
    for feature, indicators in feature_indicators.items():
        for indicator in indicators:
            if indicator.lower() in message.lower():
                # Check if this feature is available for the user's role
                if user_type in feature_links and feature in feature_links[user_type]:
                    return feature_links[user_type][feature]
                elif feature in feature_links and user_type in feature_links[feature]:
                    return feature_links[feature][user_type]

    # If no specific feature is detected, return the dashboard link for this user type
    if user_type in feature_links["dashboard"]:
        return feature_links["dashboard"][user_type]
    return feature_links["dashboard"]["default"]


# Check if message is a simple greeting
def is_simple_greeting(message):
    greetings = [
        "hi",
        "hello",
        "hey",
        "hii",
        "hiii",
        "hiiii",
        "greetings",
        "howdy",
        "good morning",
        "good afternoon",
        "good evening",
        "good day",
    ]
    return message.lower().strip() in greetings


# Get appropriate greeting response based on user type
def get_greeting_response(user_type):
    if not user_type or user_type.lower() == "guest":
        return "Hello! Please log in to access personalized assistance. How can I help you today?"

    role_specific_response = {
        "admin": "Hello, admin! I can help you manage users, monitor activities, or generate reports. What would you like to do?",
        "parent": "Hello! I can help you check your child's progress, fees, or attendance. What would you like to know?",
        "teacher": "Hi there! I can assist you with creating classes, uploading marks, or tracking attendance. How can I help you today?",
        "principal": "Hello, Principal! I can help you monitor school activities, allocate budgets, or schedule meetings. What do you need?",
        "districthead": "Hello! I can assist you with overseeing schools, allocating funds, or accessing district reports. How may I help you?",
    }

    return role_specific_response.get(
        user_type.lower(), "Hello! How can I assist you today?"
    )


def clean_response(response_text):
    """Clean up the response text to remove markdown and reasoning patterns"""
    # Remove markdown code blocks
    response_text = response_text.replace("```", "")

    # Remove numbered reasoning steps
    import re

    response_text = re.sub(r"\d+\.\s+\*\*.*?\*\*:", "", response_text)
    response_text = re.sub(r"\*\*.*?\*\*", "", response_text)

    # Remove "Here's my reasoning and response:" pattern
    response_text = re.sub(
        r"Here's my reasoning and response:.*?(?=\w)",
        "",
        response_text,
        flags=re.DOTALL,
    )

    # Remove any explicit reasoning patterns
    response_text = re.sub(
        r"As a helpful AI assistant.*?(?=\w)", "", response_text, flags=re.DOTALL
    )

    # Replace multiple newlines with a single one
    response_text = re.sub(r"\n\s*\n", "\n", response_text)

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

    # Check if user is asking about login functionality
    login_required = needs_login(message, user_type)
    if login_required and (not user_type or user_type.lower() == "guest"):
        login_response = "You need to log in to access this feature. "

        # Check if asking about a specific role functionality
        if "as a teacher" in message.lower() or "teacher functions" in message.lower():
            login_response += "Please log in with your teacher credentials to access teacher features."
        elif "as a parent" in message.lower() or "parent functions" in message.lower():
            login_response += "Please log in with your parent credentials to check your child's information."
        elif "as admin" in message.lower() or "admin functions" in message.lower():
            login_response += "Please log in with your admin credentials to access administration features."
        elif (
            "as principal" in message.lower()
            or "principal functions" in message.lower()
        ):
            login_response += "Please log in with your principal credentials to access school management features."
        else:
            login_response += "Please log in to access this feature."

        chat_history.append({"role": "assistant", "content": login_response})
        return login_response

    # Prepare full conversation history
    conversation = "\n".join(
        [f"{entry['role'].capitalize()}: {entry['content']}" for entry in chat_history]
    )

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
    5. If a guest user asks about features requiring login, suggest they log in to access those features.
    
    Give ONLY the direct response to the user's query without any explanation of your reasoning.
    Keep responses concise (2-3 sentences maximum) and natural sounding.
    DO NOT include markdown formatting, numbered steps, or reasoning steps in your response.
    
    Conversation:
    {conversation}
    """

    try:
        # Send the prompt to Gemini 2.0 Flash model
        response = client.models.generate_content(
            model="gemini-2.0-flash", contents=prompt
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

    # Get the appropriate feature link based on message content
    feature_link = get_feature_link(message, user_type)

    # Check if this is a login-required situation
    login_required = needs_login(message, user_type)

    # Use Gemini model to analyze the query
    model_response = gemini_flash_model_response(message, user_type, conversation_id)

    # Determine feature name for display
    feature_name = "this feature"
    link_text = "Click here"  # Default link text

    for feature, indicators in feature_indicators.items():
        for indicator in indicators:
            if indicator.lower() in message.lower():
                feature_name = feature.replace("_", " ")
                link_text = f"Go to {feature_name.title()}"
                break

    # For login required cases
    if login_required and (not user_type or user_type.lower() == "guest"):
        action_text = f"Log in to access {feature_name}"
        link_text = "Log in"
    else:
        action_text = f"View {feature_name}"

    return {
        "response": model_response,
        "link": feature_link,
        "conversationId": conversation_id,
        "loginRequired": login_required
        and (not user_type or user_type.lower() == "guest"),
        "actionText": action_text,
        "featureName": feature_name,
        "linkText": link_text,  # Add link text for frontend
    }


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message", "")
    user_type = data.get("userType", "guest")
    conversation_id = data.get("conversationId")

    # Ensure user_type is not empty
    if not user_type or user_type == "":
        user_type = "guest"

    # Get response from AI model
    response_data = generate_response(message, user_type, conversation_id)

    return jsonify(
        {
            "message": message,
            "userType": user_type,
            "response": response_data["response"],
            "link": response_data.get("link", None),
            "loginRequired": response_data.get("loginRequired", False),
            "actionText": response_data.get("actionText", "access this feature"),
            "featureName": response_data.get("featureName", "this feature"),
            "linkText": response_data.get(
                "linkText", "Click here"
            ),  # Include link text in response
            "conversationId": response_data.get("conversationId", conversation_id),
        }
    )


if __name__ == "__main__":
    app.run(host="https://emis-avxn.onrender.com", port=5000)
