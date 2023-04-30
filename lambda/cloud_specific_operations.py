import boto3
from utils import parse_word2vec_format


def get_embeddings():
    embedding_local_file = '/tmp/embeddings'
    s3 = boto3.resource('s3')
    s3.Bucket('belarus-embedding').download_file('word2vec-100-bel-cc100.vectors', embedding_local_file)
    with open(embedding_local_file) as file:
        emb = parse_word2vec_format(file)
    return emb
