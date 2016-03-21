import random
import hashlib
import json

from google.appengine.ext import ndb

from master_handlers import *
from models import *

class SignupHandler(Handler):
    def get(self):
        self.render('signup.html')
    def post(self):
        username = self.request.get('username')
        password = self.request.get('password')
        salt = User.get_salt()
        password_digest = User.make_pw_hash(username,password,salt)
        user = User(username=username,
                    password_digest=password_digest,
                    salt=salt)
        user.put()
        self.session['username'] = user.username
        self.redirect('/')

class LoginHandler(Handler):
    def get(self):
        self.render('login.html')
    def post(self):
        username = self.request.get('username')
        password = self.request.get('password')
        if User.login(username,password):
            self.session['username'] = username
            self.redirect('/')
        else:
            self.render('login.html',error="Bad username or password")

class LogoutHandler(Handler):
    def get(self):
        self.session['username'] = None
        self.redirect('/')

class UpdatePlayerStats(Handler):
    def post(self):
        username = self.session['username']
        user = User.by_name(username)
        stats = user.stats
        user_times = stats['times']
        data = json.loads(self.request.body)
        game_description = data['describeGame']
        game_times = data['times']
        updated_times = user_times + game_times
        stats['median'] = User.get_median(updated_times)
        stats['game_history'].append(game_description)
        stats['record'] = user.get_record()
        stats['times'] = updated_times
        user.stats = stats
        user.put()
        self.write('OK')

class DropUsers(Handler):
    def get(self):
        users = User.query()
        for user in users:
            user.key.delete()
