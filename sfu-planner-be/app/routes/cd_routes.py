from flask import Blueprint, request, jsonify
from app import mongo

cd_bp = Blueprint('cd_bp', __name__)

@cd_bp.route("/", methods=["GET"])
def get_course_grade():
    course = request.args.get("course", None)
    
    if course:
        # Fetch the document from the MongoDB collection where 'course_name' matches 'course'
        course_data = mongo.db.mydatabase.find_one({"course_name": course})
        
        if course_data:
            # Convert ObjectId to string and exclude the '_id' field from the response
            course_data['_id'] = str(course_data['_id'])
            return jsonify(course_data)
        else:
            return jsonify({'error': 'Course not found'}), 404
    else:
        return jsonify({'error': 'No course parameter provided'}), 400
