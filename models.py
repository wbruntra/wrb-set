from google.appengine.ext import ndb
from google.appengine.ext import db

import random
import hashlib

class User(ndb.Model):
    username = ndb.StringProperty()
    password_digest = ndb.StringProperty()
    salt = ndb.StringProperty()
    stats = ndb.JsonProperty(default={'times':[],
                                    'game_history':[]})

    def get_record(self):
        history = self.stats['game_history']
        total_games = len(history)
        wins = sum([1 for x in history if x[0]])
        return (wins,total_games)

    @classmethod
    def get_median(cls,list):
        m = sorted([x for x in list])
        middle = (len(m)-1)/2
        if (len(m) % 2 == 1):
            return m[middle]
        else:
            return float(m[middle]+m[middle+1]) / 2

    @classmethod
    def get_salt(cls):
        chars = [chr(x) for x in (range(65,91)+range(97,123))]
        result = ''.join([random.choice(chars) for i in range(7)])
        return result

    @classmethod
    def make_pw_hash(cls, name, pw, salt):
        h = hashlib.sha256(name+pw+salt).hexdigest()
        return '%s' % (h)

    @classmethod
    def valid_pw(cls, name, password, salt, h):
        return h == User.make_pw_hash(name, password, salt)

    @classmethod
    def by_name(cls, name):
        u = User.query(User.username == name).get()
        return u

    @classmethod
    def login(cls, name, pw):
        u = cls.by_name(name)
        if u and User.valid_pw(name, pw, u.salt, u.password_digest):
            return u

class Score(ndb.Model):
    player = ndb.StringProperty()
    score = ndb.IntegerProperty()
    date = ndb.DateTimeProperty(auto_now_add=True)

class Game(db.Model):
    host_token = db.StringProperty()
    player_tokens = db.StringListProperty()
    player_nicks = db.StringListProperty()
    num_players = db.IntegerProperty()

class OnlineHost(db.Model):
    host_nick = db.StringProperty()
    game_code = db.StringProperty()
    created = db.DateTimeProperty(auto_now_add=True)
