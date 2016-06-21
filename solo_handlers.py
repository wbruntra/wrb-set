from master_handlers import *
from models import *

class SoloHandler(Handler):
    def get(self):
        guestbook_name = self.request.get('guestbook_name',DEFAULT_GUESTBOOK_NAME)
        scores_query = Score.query(
        ancestor=guestbook_key(guestbook_name)).order(-Score.score)
        scores = scores_query.fetch(10)
        try:
          lowest_score = scores[-1].score
        except:
          lowest_score = 0
        player = self.request.cookies.get('player','Anonymous')
        self.render('solo.html',player=player,lowest_score=lowest_score)

class ScoreHandler(Handler):
    def get(self):
        guestbook_name = self.request.get('guestbook_name',DEFAULT_GUESTBOOK_NAME)
        scores_query = Score.query(
        ancestor=guestbook_key(guestbook_name)).order(-Score.score)
        scores = scores_query.fetch(10)

        self.render('scores.html',scores=scores)

    def post(self):
        guestbook_name = self.request.get('guestbook_name',
                                          DEFAULT_GUESTBOOK_NAME)
        score = Score(parent=guestbook_key(guestbook_name))

        stored_name = self.request.get('user')
        if stored_name == 'null':
          stored_name = 'Nobody'

        self.response.headers.add_header('Set-Cookie', 'player=%s' % stored_name.encode('utf8'))

        if len(stored_name) > 100:
            stored_name = stored_name[:100]

        score.player = stored_name
        score.score = int(self.request.get('score'))
        score.put()

        self.redirect('/scores')
