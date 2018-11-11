# Python Base
This is a python flask base to build off of. It contains the following:
- flask_login setup
- mongoengine connecting to a mongolab setup
- factory method for different dev/prod configurations
- User model in MongoEngine
- User registration route and page  
- example form
- example get and post routes
- pipenv runtime setup

## Setup App
1. `pip install pipenv`
2. In the main directory, `pipenv install`, this handles your virtual environment using the Pipfile much like npm
3. Follow the instructions in `example.env` to set your env variables/db

## Run App
1. `pipenv shell` enters the virtual environment
2. `flask run`, runs app.py with .env variables
- if you uncommented debug mode in the .env, flask run will enter debug mode and automatically reload on changes

*Can also not shell and prefix any command with `pipenv run` i.e `pipenv run flask run``*

### Optional changes
#### Changing Database 
Mongoengine is currently setup which enforces a schema on a document database. If you don't want a enforced schema, you do need to remove the references in config.py,  __init__.py, and the registration route in main/views.py.

