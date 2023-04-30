import json
import boto3
from utils import parse_word2vec_format, words_by_distance

EMBEDDING_BUCKET = 'belarus-embedding'
EMBEDDING_OBJECT = 'word2vec-100-bel-cc100.vectors'
EMBEDDING_LOCAL_FILE = '/tmp/embeddings'

s3 = boto3.resource('s3')


def lambda_handler(event, context):
    s3.Bucket(EMBEDDING_BUCKET).download_file(EMBEDDING_OBJECT, EMBEDDING_LOCAL_FILE)
    print(event)
    with open(EMBEDDING_LOCAL_FILE) as file:
        emb = parse_word2vec_format(file)
    query_params = event.get('queryStringParameters')
    query_params = {} if query_params is None else query_params
    words = words_by_distance(emb, query_params.get('word', 'ABSENT'))
    print(words[:10])
    return {
        'statusCode': 200,
        'body': json.dumps(words, ensure_ascii=False)
    }