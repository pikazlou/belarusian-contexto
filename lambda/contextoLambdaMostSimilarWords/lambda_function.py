import json
from utils import words_by_distance
from cloud_specific_operations import get_embeddings


def lambda_handler(event, context):
    print(event)
    word = event['queryStringParameters']['word']
    emb = get_embeddings()
    words = words_by_distance(emb, word)
    print(words[:10])
    return {
        'statusCode': 200,
        'body': json.dumps(words, ensure_ascii=False)
    }
