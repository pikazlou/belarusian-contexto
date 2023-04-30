import json
from cloud_specific_operations import get_word_rank


def lambda_handler(event, context):
    print(event)
    game = event['pathParameters']['game']
    word = event['queryStringParameters']['word']
    rank = get_word_rank(game, word)
    print(rank)
    return {
        'statusCode': 200,
        'body': json.dumps({"rank": rank}, ensure_ascii=False, default=str)
    }