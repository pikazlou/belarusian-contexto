import sys
import json
import hashlib
import numpy as np
from flask import Flask
from waitress import serve
from gensim.models import KeyedVectors

app = Flask(__name__)


@app.route('/game/<game_id>/guess/<word>')
def guess_word(game_id, word):
    rank = -1
    top_words = []
    target = get_target_word(game_id)
    if word == target:
        rank = 0
        top_words = w2v.most_similar(target, topn=50)
    else:
        if word in w2v:
            rank = w2v.rank(target, word)
    return json.dumps({'rank1': rank, 'top_words': top_words}, ensure_ascii=False)


@app.route('/game/<game_id>/hint/<word>')
def hint(game_id, word):
    target = get_target_word(game_id)
    hint_rank = -1
    hint_word = ''
    if word in w2v:
        rank = w2v.rank(target, word)
        if rank > 2:
            hint_rank = rank-1
            hint_word = w2v.most_similar(target, topn=hint_rank)[hint_rank-1][0]
        else:
            hint_rank = rank
            hint_word = word
    return json.dumps({'rank': hint_rank, 'word': hint_word}, ensure_ascii=False)


def get_target_word(game_id: str):
    seed = int(hashlib.md5(game_id.encode('utf-8')).hexdigest()[:8], 16)
    np.random.seed(seed)
    target_index = np.random.randint(1000)
    return w2v.index_to_key[target_index]


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print('expected CLI paramater - path to word2vec vectors file')
        sys.exit(1)
    w2v = KeyedVectors.load_word2vec_format(sys.argv[1])
    serve(app, host="0.0.0.0", port=8000)
    #app.run(debug=True)