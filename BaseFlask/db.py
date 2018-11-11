from pymongo import MongoClient
import os

company_client = MongoClient(os.environ.get('MONGODB_HOST'))
companies_db = company_client['companies']
company_collection = companies_db.data