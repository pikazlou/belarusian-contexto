import sys
import json
import hashlib
from time import strftime
import logging
from logging.handlers import RotatingFileHandler
import numpy as np
from flask import Flask, request, send_from_directory, redirect
from waitress import serve
from gensim.models import KeyedVectors

app = Flask(__name__)

@app.route('/')
def root():
    return redirect('index.html')


@app.route('/<path:path>')
def serve_static(path):
    print(path)
    return send_from_directory('../site', path)


@app.route('/guess', methods=['POST'])
def guess_word():
    game_id, word = get_game_id_and_word()
    if not (game_id and word):
        return json.dumps({'message': 'Missing game_id or word in request body'}), 400

    rank = -1
    top_words = []
    total_words = len(w2v.index_to_key)
    target = get_target_word(game_id)
    if word == target:
        rank = 1
        top_words = [w for w, _ in w2v.most_similar(target, topn=50)]
    else:
        if word in w2v:
            rank = w2v.rank(target, word) + 1

    timestamp = strftime('[%Y-%b-%d %H:%M:%S]')
    logger.info('%s <ip>:%s <game id>:%s <word>:%s <rank>:%s <total words>:%s <top words>:%s', timestamp,
                request.remote_addr, game_id, word, rank, total_words, top_words)

    return json.dumps({'rank': rank, 'word': word, 'total_words': total_words, 'top_words': top_words}, ensure_ascii=False)


@app.route('/hint', methods=['POST'])
def hint():
    game_id, word = get_game_id_and_word()
    if not (game_id and word):
        return json.dumps({'message': 'Missing game_id or word in request body'}), 400

    hint_rank = -1
    hint_word = ''
    total_words = len(w2v.index_to_key)
    target = get_target_word(game_id)
    if word in w2v:
        rank = w2v.rank(target, word)
        if rank > 2:
            hint_rank = rank-1
            hint_word = w2v.most_similar(target, topn=hint_rank)[hint_rank-1][0]
        else:
            hint_rank = rank
            hint_word = word
        hint_rank += 1
    return json.dumps({'rank': hint_rank, 'word': hint_word, 'total_words': total_words, 'top_words': []}, ensure_ascii=False)


def get_game_id_and_word():
    body = request.json
    if not ('game_id' in body and 'word' in body):
        return '', ''

    game_id = str(body['game_id'])
    word = str(body['word']).replace("’", "'")
    return game_id, word


def get_target_word(game_id: str):
    seed = int(hashlib.md5(game_id.encode('utf-8')).hexdigest()[:8], 16)
    np.random.seed(seed)
    target_index = np.random.randint(1000)
    return w2v.index_to_key[target_index]


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('expected CLI paramater - path to word2vec vectors file')
        sys.exit(1)
    w2v = KeyedVectors.load_word2vec_format(sys.argv[1])
    handler = RotatingFileHandler('app.log', maxBytes=100000, backupCount=3)
    logger = logging.getLogger('tdm')
    logger.setLevel(logging.INFO)
    logger.addHandler(handler)
    if len(sys.argv) == 3:
        app.run(debug=True, port=8000)
    else:
        serve(app, host="0.0.0.0", port=8000)
