from master_handlers import *
from solo_handlers import *
from multi_handlers import *
from user_handlers import *

app_routes = [
    ('/', MainHandler),
    ('/active',ActiveHandler),
    ('/chat',ChatHandler),
    ('/clear',ClearHandler),
    ('/multi', MultiHandler),
    ('/multi-old',OldMultiHandler),
    ('/solo',NewSoloHandler),
    ('/solo-old',SoloHandler),
    ('/host',HostHandler),
    ('/broadcast',BroadcastHandler),
    ('/move',MoveHandler),
    ('/join',JoinHandler),
    ('/opened',OpenHandler),
    ('/client',ClientHandler),
    ('/scores',ScoreHandler),
    ('/rules',RulesHandler),
    ('/signup',SignupHandler),
    ('/login',LoginHandler),
    ('/logout',LogoutHandler),
    ('/profile',ProfileHandler),
    ('/update_player',UpdatePlayerStats),
    ('/dropusers',DropUsers)
]
