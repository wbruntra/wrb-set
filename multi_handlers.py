from master_handlers import *
from models import *

import random
from google.appengine.api import channel
import json
import uuid

import time
import datetime

class HostHandler(Handler):
    #create new game and set user as host
    def get(self):
        game_key = str(random.randint(1001,9999))
        self.response.set_cookie('game_key',game_key)
        self.response.set_cookie('nickname','')
        player_id = str(uuid.uuid4()).replace('-','')
        template_vars = {'game_key':game_key}
        self.render('host.html',**template_vars)
    def post(self):
        nickname = self.request.get('nickname')
        self.response.set_cookie('nickname',nickname)
        self.redirect('/multi')


class ActiveHandler(Handler):
  ## show currently active games for joining
  def get(self):
    hosts_query = db.Query(OnlineHost)
    hosts = hosts_query.fetch(100)
    active_hosts = []
    for host in hosts:
      if ((datetime.datetime.now() - host.created).seconds < 600):
        active_hosts.append(host)
    self.render('active.html',hosts=active_hosts)

class MultiHandler(Handler):
    ## represents host in active multiplayer game
    def get(self):
        game_key = self.request.cookies.get('game_key')
        nickname = self.request.cookies.get('nickname')
        if (not game_key or not nickname):
          self.redirect('/host')
        else:
          player_id = str(uuid.uuid4()).replace('-','')
          token = channel.create_channel(player_id)
          game = Game(key_name = game_key,
                      host_token = token,
                      num_players = 1)
          game.player_nicks.append(nickname)
          game.put()
          host = OnlineHost(key_name = player_id,
                            host_nick=nickname,
                            game_code = game_key)
          host.put()
          template_vars = {'player':nickname,
                          'game_key':game_key,
                          'token':token,
                          'host':'yes'}
          self.render('multi.html',**template_vars)
    def post(self):
        nickname = self.request.get('nickname')
        self.response.set_cookie('nickname',nickname)
        self.redirect('/multi')

class ClientHandler(Handler):
    def get(self):
        player = self.request.cookies.get('nickname')
        game_key = self.request.get('g')
        game = Game.get_by_key_name(game_key)
        player_id = str(uuid.uuid4()).replace('-','')
        token = channel.create_channel(player_id)
        player_list = game.player_tokens
        player_list += [token]
        game.num_players += 1
        game.player_nicks.append(player)
        game.put()
        template_vars = {'token':token,
                        'game_key':game_key,
                        'player':player,
                        'host':'no'}
        self.render('client.html',**template_vars)


class MoveHandler(Handler):
    def post(self):
        game_key = self.request.get('g')
        game = Game.get_by_key_name(game_key)
        host_token = game.host_token
        nickname = self.request.get('actor')
        action = self.request.get('action')
        if action == 'exit':
            game.player_nicks.remove(nickname)
            game.put()
        cards = self.request.get('cards')
        msg = {'nickname':nickname,
               'action':action}
        if cards:
            msg['cards'] = cards.split(',')
        channel_msg = json.dumps(msg)
        channel.send_message(host_token,channel_msg)


class JoinHandler(Handler):
    #handle requests to join an existing game
    def get(self):
        game_key = self.request.get('g')
        self.response.set_cookie('game_key',game_key)
        self.render('join.html',game_key = game_key)
    def post(self):
        nickname = self.request.get('nickname')
        self.response.set_cookie('nickname',nickname.encode('utf8'))
        game_key = self.request.get('game-key')
        game = Game.get_by_key_name(game_key)
        if not game:
          error = "Game does not exist!"
          self.render('join.html',game_key=game_key,error=error)
        elif nickname in game.player_nicks:
          error = "Nickname already taken!"
          self.render('join.html',game_key=game_key,error=error)
        else:
          self.redirect('/client?g='+game_key)

class BroadcastHandler(Handler):
    def post(self):
        game_key = self.request.get('g')
        game = Game.get_by_key_name(game_key)
        tokens = game.player_tokens
        action = self.request.get('action')
        state = json.loads(self.request.get('state'))
        actor = self.request.get('actor')
        cards = self.request.get('cards').split(',')
        msg = {'action':action,
               'state':state,
               'cards':cards,
               'actor':actor,
              }
        channel_msg = json.dumps(msg)
        for token in tokens:
            channel.send_message(token, channel_msg)

class ChatHandler(Handler):
    def post(self):
        game_key = self.request.get('g')
        chatter = self.request.get('chatter')
        chat = self.request.get('chat')
        event = self.request.get('event')
        msg = {'action':'chat',
               'sender':chatter,
               'chat':chat,
              'event':event}
        channel_msg = json.dumps(msg)
        game = Game.get_by_key_name(game_key)
        tokens = game.player_tokens
        host_token = game.host_token
        for token in tokens:
            channel.send_message(token,channel_msg)
        channel.send_message(host_token,channel_msg)

class OpenHandler(Handler):
    def post(self):
      game_key = self.request.get('g')
      nickname = self.request.cookies.get('nickname')
      game = Game.get_by_key_name(game_key)
      host_token = game.host_token
      msg = {'nickname':nickname,
            'action':'joined'}
      channel.send_message(host_token,json.dumps(msg))
