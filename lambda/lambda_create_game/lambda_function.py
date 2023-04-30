import json
from cloud_specific_operations import get_embeddings, put_words_order_for_game
from utils import words_by_distance


def lambda_handler(event, context):
    print(event)
    word = event['queryStringParameters']['word']
    game = event['queryStringParameters']['game']
    emb = get_embeddings()
    words = words_by_distance(emb, word)
    put_words_order_for_game(game, words)
    return {
        'statusCode': 200,
        'body': json.dumps('Ok', ensure_ascii=False)
    }