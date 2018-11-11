from flask import Blueprint, render_template, request, flash, redirect, url_for
from db import company_collection
import json 

main = Blueprint('main', __name__)

@main.route('/')
def index():
    companies = list(company_collection.find({}, {'_id':0}))
    companies.sort(key=lambda x: x['company'])
    print(companies[:3])
    print(json.dumps(companies[:3]))
    return render_template("index.html", companies=companies)