import os
import urllib

import webapp2

from google.appengine.ext import db
from google.appengine.ext import ndb

# import time
# import datetime

# from models import *
from routes import app_routes

config = {}
config['webapp2_extras.sessions'] = {
    'secret_key' : 'super-secret-key',
}

app = webapp2.WSGIApplication(routes=app_routes, debug=True, config=config)
