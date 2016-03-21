import os

from google.appengine.ext import db
from google.appengine.ext import ndb

import jinja2
import webapp2

from webapp2_extras import sessions
from models import *

import logging

log = logging.getLogger(__name__)

template_dir = os.path.join(os.path.dirname(__file__), 'templates')
jinja_env = jinja2.Environment(loader = jinja2.FileSystemLoader(template_dir),
                               autoescape = True)


DEFAULT_GUESTBOOK_NAME = 'default_guestbook'

def guestbook_key(guestbook_name=DEFAULT_GUESTBOOK_NAME):
    """Constructs a Datastore key for a Guestbook entity with guestbook_name."""
    return ndb.Key('Guestbook', guestbook_name)

def render_str(template, **params):
  t = jinja_env.get_template(template)
  return t.render(params)

class Handler(webapp2.RequestHandler):
    def write(self, *a, **kw):
        self.response.out.write(*a, **kw)

    def render(self, template, **kw):
        jinja_env.globals['session'] = self.session
        self.response.out.write(render_str(template, **kw))

    def dispatch(self):
        # Get a session store for this request.
        self.session_store = sessions.get_store(request=self.request)

        try:
            # Dispatch the request.
            webapp2.RequestHandler.dispatch(self)
        finally:
            # Save all sessions.
            self.session_store.save_sessions(self.response)

    @webapp2.cached_property
    def session(self):
        # Returns a session using the default cookie key.
        return self.session_store.get_session()

class MainHandler(Handler):
  def get(self):
    self.render('index.html')

class ClearHandler(Handler):
  def get(self):
    hosts = OnlineHost.all()
    db.delete(hosts)

class RulesHandler(Handler):
    def get(self):
        self.render('rules.html')

class ProfileHandler(Handler):
    def get(self):
        username = self.session['username']
        user = User.by_name(username)
        log.info(user.stats)
        self.render('profile.html',user=user)
