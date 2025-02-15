from flask import Blueprint, request, jsonify, make_response
from app import mongo
import uuid
import re
from bson.objectid import ObjectId

# Blueprint for User and Schedule Routes
user_bp = Blueprint('user_bp', __name__)

# Helper Function to Validate Input Data
def is_valid_string(input_string):
    if not isinstance(input_string, str) or len(input_string) > 255 or not re.match(r"^[a-zA-Z0-9_\-\s/]+$", input_string):
        return False
    return True

# Endpoint to Create or Retrieve User UUID
@user_bp.route('/uuid', methods=['GET'])
def create_or_get_uuid():
    user_uuid = request.cookies.get('user_uuid')
    if not user_uuid:
        user_uuid = str(uuid.uuid4())
        response = make_response(jsonify({"message": "UUID created"}))
        response.set_cookie(
            "user_uuid",
            user_uuid,
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=60*60*24*365  # 1 year expiry
        )
        return response
    return jsonify({"message": "UUID exists"})

# Middleware to Ensure UUID Exists
def ensure_uuid():
    user_uuid = request.cookies.get('user_uuid')
    print(user_uuid)
    if not user_uuid:
        return jsonify({"error": "User UUID not found. Please reload the app."}), 400
    return user_uuid

# Save Schedule Endpoint
@user_bp.route('/save', methods=['POST'])
def save_schedule():
    user_uuid = ensure_uuid()
    if isinstance(user_uuid, tuple):  # Error response from ensure_uuid
        return user_uuid

    data = request.json
    schedule_name = data.get('name')
    term = data.get('term')
    course_ids = data.get('course_ids')

    if not schedule_name or not course_ids or not is_valid_string(schedule_name):
        return jsonify({"error": "Invalid or missing fields"}), 400

    if not all(is_valid_string(course_id['offering']) for course_id in course_ids):
        return jsonify({"error": "Invalid course IDs"}), 400

    user = mongo.db.schedules.find_one({"user_id": user_uuid})
    if user:
        schedules = user.get('schedules', [])
        if len(schedules) >= 4:
            return jsonify({"error": "Maximum number of schedules reached (4)"}), 400

        for schedule in schedules:
            if schedule['name'] == schedule_name:
                schedule['term'] = term
                schedule['course_ids'] = course_ids
                break
        else:
            schedules.append({"name": schedule_name, "term": term, "course_ids": course_ids})
        mongo.db.schedules.update_one({"user_id": user_uuid}, {"$set": {"schedules": schedules}})
    else:
        mongo.db.schedules.insert_one({
            "user_id": user_uuid,
            "schedules": [{"name": schedule_name, "term": term, "course_ids": course_ids}]
        })

    return jsonify({"message": "Schedule saved successfully"})

# Retrieve Schedules Endpoint
@user_bp.route('/', methods=['GET'])
def get_schedules():
    user_uuid = ensure_uuid()
    if isinstance(user_uuid, tuple):  # Error response from ensure_uuid
        return user_uuid

    user = mongo.db.schedules.find_one({"user_id": user_uuid})
    if user:
        return jsonify(user.get('schedules', []))
    return jsonify([])

# Load Course Details Endpoint
@user_bp.route('/courses', methods=['POST'])
def get_course_details():
    user_uuid = ensure_uuid()
    if isinstance(user_uuid, tuple):  # Error response from ensure_uuid
        return user_uuid

    data = request.json
    course_ids = data.get('course_ids')

    if not course_ids or not all(is_valid_string(course_id) for course_id in course_ids):
        return jsonify({"error": "Invalid or missing course IDs"}), 400

    # Simulated fetch course details logic (replace with actual API integration)
    course_details = [
        {"course_id": course_id, "course_name": f"Course {course_id}", "description": f"Details for {course_id}"}
        for course_id in course_ids
    ]
    return jsonify(course_details)

# Delete Schedule Endpoint
@user_bp.route('/delete', methods=['POST'])
def delete_schedule():
    user_uuid = ensure_uuid()
    if isinstance(user_uuid, tuple):  # Error response from ensure_uuid
        return user_uuid

    data = request.json
    schedule_name = data.get('name')

    if not schedule_name or not is_valid_string(schedule_name):
        return jsonify({"error": "Invalid or missing schedule name"}), 400

    user = mongo.db.schedules.find_one({"user_id": user_uuid})
    if user:
        schedules = [schedule for schedule in user.get('schedules', []) if schedule['name'] != schedule_name]
        mongo.db.schedules.update_one({"user_id": user_uuid}, {"$set": {"schedules": schedules}})
        return jsonify({"message": "Schedule deleted successfully"})

    return jsonify({"error": "Schedule not found"}), 404
