"""Starting template for Google App Engine applications.

Use this project as a starting point if you are just beginning to build a Google
App Engine project. Remember to download the OAuth 2.0 client secrets which can
be obtained from the Developer Console <https://code.google.com/apis/console/>
and save them as 'client_secrets.json' in the project directory.
"""

__author__ = 'jcgregorio@google.com (Joe Gregorio)'


import httplib2
import logging
import os
import pickle
import webapp2

from googleapiclient import discovery
from oauth2client.appengine import oauth2decorator_from_clientsecrets
from oauth2client.client import AccessTokenRefreshError
from google.appengine.api import memcache

from webapp2_extras import jinja2


# CLIENT_SECRETS, name of a file containing the OAuth 2.0 information for this
# application, including client_id and client_secret, which are found
# on the API Access tab on the Google APIs
# Console <http://code.google.com/apis/console>
CLIENT_SECRETS = os.path.join(os.path.dirname(os.path.dirname(__file__)),
    'client_secrets.json')

# Helpful message to display in the browser if the CLIENT_SECRETS file
# is missing.
MISSING_CLIENT_SECRETS_MESSAGE = """
<h1>Warning: Please configure OAuth 2.0</h1>
<p>
To make this sample run you will need to populate the client_secrets.json file
found at:
</p>
<p>
<code>%s</code>.
</p>
<p>with information found on the <a
href="https://code.google.com/apis/console">APIs Console</a>.
</p>
""" % CLIENT_SECRETS


http = httplib2.Http(memcache)
service = discovery.build("plus", "v1", http=http)
decorator = oauth2decorator_from_clientsecrets(
    CLIENT_SECRETS,
    'https://www.googleapis.com/auth/plus.me',
    MISSING_CLIENT_SECRETS_MESSAGE)

import webapp2


class BaseHandler(webapp2.RequestHandler):

    @webapp2.cached_property
    def jinja2(self):
        # Returns a Jinja2 renderer cached in the app registry.
        return jinja2.get_jinja2(app=self.app)

    def render_response(self, _template, **context):
        # Renders a template and writes the result to the response.
        rv = self.jinja2.render_template(_template, **context)
        self.response.write(rv)


class MainHandler(BaseHandler):

  @decorator.oauth_aware
  def get(self):
    variables = {
        'url': decorator.authorize_url(),
        'has_credentials': decorator.has_credentials()
        }
    self.render_response('grant.html', **variables)


class AboutHandler(BaseHandler):

  @decorator.oauth_required
  def get(self):
    try:
      http = decorator.http()
      user = service.people().get(userId='me').execute(http)
      text = 'Hello, %s!' % user['displayName']

      self.render_response('welcome.html', text=text)
    except AccessTokenRefreshError:
      self.redirect('/')

app = webapp2.WSGIApplication(
    [
     ('/', MainHandler),
     ('/about', AboutHandler),
     (decorator.callback_path, decorator.callback_handler())
    ],
    debug=True)
