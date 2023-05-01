import json
from cloud_specific_operations import get_rank_by_word


def lambda_handler(event, context):
    print(event)
    game = event['pathParameters']['game']
    word = event['queryStringParameters']['word']
    rank = get_rank_by_word(game, word)
    print(rank)
    return {
        'statusCode': 200,
        'body': json.dumps({"rank": rank}, ensure_ascii=False, default=str)
    }