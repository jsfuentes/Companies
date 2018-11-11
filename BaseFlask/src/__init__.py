from flask import Flask

#local config.py
from .config import config

#Factory Creation of App Allowing Ez calling of other config rules
def create_app(config_name):
    app = Flask(__name__)
    #app.config is a dictionary object used for flask as well as package config
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    # from .api import api as api_blueprint
    # app.register_blueprint(api_blueprint, url_prefix='/api')

    return app
