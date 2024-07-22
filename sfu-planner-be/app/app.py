from flask import Flask, jsonify, request
from utils.api_helpers import parse_term_code, fetch_data_from_api, process_course_number_data, process_course_section_data, process_course_number_and_section_data
import os
from dotenv import load_dotenv
import datetime
import ratemyprofessor
from flask_cors import CORS


load_dotenv()
SFU_API_BASE_URL = os.getenv('SFU_API_BASE_URL')

app = Flask(__name__)
CORS(app)


@app.route("/termcodes", methods=["GET"])
def generate_term_codes():
    # Get the current date
    today = datetime.datetime.today()
    year = today.year
    month = today.month

    # Determine the current term code suffix based on the month
    if 1 <= month <= 4:
        current_suffix = '1'
        next_suffixes = ['4', '7']
    elif 5 <= month <= 8:
        current_suffix = '4'
        next_suffixes = ['7', '1']
    else:
        current_suffix = '7'
        next_suffixes = ['1', '4']

    # Generate the current term code
    term_codes = []
    current_code = '1{}{}'.format(str(year)[-2:], current_suffix)
    term_codes.append(current_code)

    # Generate the next two term codes 
    for suffix in next_suffixes:
        if suffix == '1':  # Increment the year if the next term is '1'
            year += 1
        code = '1{}{}'.format(str(year)[-2:], suffix)
        term_codes.append(code)

    return term_codes

@app.route("/rmpapi", methods=["GET"])
def get_professor_rating():
    name = request.args.get("name", None)

    professor = ratemyprofessor.get_professor_by_school_and_name(
    ratemyprofessor.get_school_by_name("Simon Fraser University"), name)
    if (professor is None):
        return jsonify({})
                       
    return jsonify(
        {
        'name': professor.name, 
        'department': professor.department,
        'rating': professor.rating,
        'num_ratings': professor.num_ratings,
        'difficulty': professor.difficulty,
        }
    )

@app.route("/sfuapi", methods=["GET"])
def get_api_response():
    termCode = request.args.get("termCode", None) # i.e. 2024 Summer - ["CMPT", "MATH", "STAT", ...]
    major = request.args.get("major", None) # i.e. CMPT - [120, 125, 225, 276, ...]
    course_number = request.args.get("course", None) # i.e. 120 - [D100, D200, D300, ...]
    course_section = request.args.get("section", None) # i.e. D100 - [prof, time, location, ...]
    
    semester = parse_term_code(termCode)
    year = semester[0]
    term = semester[1]

    response = {} 

    # Check what parameters are given and perform the corresponding task
    if course_section:
        response = fetch_data_from_api(f"{SFU_API_BASE_URL}{year}/{term}/{major}/{course_number}/{course_section}")
        response = process_course_section_data(response)
    elif course_number:
        response = fetch_data_from_api(f"{SFU_API_BASE_URL}{year}/{term}/{major}/{course_number}")
        response = process_course_number_and_section_data(response, year, term, major, course_number)
    elif major:
        response = fetch_data_from_api(f"{SFU_API_BASE_URL}{year}/{term}/{major}")
    elif termCode:
        response = fetch_data_from_api(f"{SFU_API_BASE_URL}{year}/{term}")

    if not response:
        return jsonify({"error": "No valid parameters provided"}), 400

    return jsonify(response)


if __name__ == "__main__":
    app.run(debug=True)
