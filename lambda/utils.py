import numpy as np


def parse_word2vec_format(lines_it: iter):
    result = {}
    next(lines_it) #skip word2vec header (<number of words> <embedding dimensionality>)
    for line in lines_it:
        tokens = line.split()
        word = tokens[0]
        vec = np.array([float(s) for s in tokens[1:]])
        result[word] = vec
    return result


def words_by_distance(embeddings: dict, word: str):
    if word not in embeddings:
        return []
    word_emb = embeddings[word]
    words_with_distances = [(k, cos_similarity(word_emb, v)) for k, v in embeddings.items()]
    sorted_words_with_distances = sorted(words_with_distances, reverse=True, key=lambda pair: pair[1])
    return [w[0] for w in sorted_words_with_distances]


def cos_similarity(vec1: np.ndarray, vec2: np.ndarray):
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
