from flask import Blueprint, jsonify
import datetime

term_bp = Blueprint('term_bp', __name__)

@term_bp.route("/", methods=["GET"])
def generate_term_codes():
    today = datetime.datetime.today()
    year = today.year
    month = today.month

    if 1 <= month <= 4:
        current_suffix = '1'
        next_suffixes = ['4', '7']
    elif 5 <= month <= 8:
        current_suffix = '4'
        next_suffixes = ['7', '1']
    else:
        current_suffix = '7'
        next_suffixes = ['1', '4']

    term_codes = []
    current_code = '1{}{}'.format(str(year)[-2:], current_suffix)
    term_codes.append(current_code)

    for suffix in next_suffixes:
        if suffix == '1':
            year += 1
        code = '1{}{}'.format(str(year)[-2:], suffix)
        term_codes.append(code)

    return jsonify(term_codes)
