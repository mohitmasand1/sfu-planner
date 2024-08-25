from flask import Blueprint, request, jsonify
import ratemyprofessor

rmp_bp = Blueprint('rmp_bp', __name__)

@rmp_bp.route("/", methods=["GET"])
def get_professor_rating():
    name = request.args.get("name", None)
    professor = ratemyprofessor.get_professor_by_school_and_name(
        ratemyprofessor.get_school_by_name("Simon Fraser University"), name)
    if professor is None:
        return jsonify({})
                       
    return jsonify({
        'name': professor.name, 
        'department': professor.department,
        'rating': professor.rating,
        'num_ratings': professor.num_ratings,
        'difficulty': professor.difficulty,
    })
