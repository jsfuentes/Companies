from pymongo import MongoClient
import os

if os.environ.get('MONGODB_HOST') is None:
    raise Exception("No database host defined")
    
company_client = MongoClient(os.environ.get('MONGODB_HOST'))
companies_db = company_client['companies']
company_collection = companies_db.data

#Use to test db access 
if __name__ == "__main__":
    print("Testing db")
    print(list(company_collection.find({})))

