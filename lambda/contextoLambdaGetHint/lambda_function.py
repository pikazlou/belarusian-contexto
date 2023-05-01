import json
from cloud_specific_operations import get_rank_by_word, get_word_by_rank


def lambda_handler(event, context):
    print(event)
    game = event['pathParameters']['game']
    word = event['queryStringParameters']['word']
    rank = get_rank_by_word(game, word)
    if rank > 0:
        result = get_word_by_rank(game, rank // 2)
    else:
        result = word
    return {
        'statusCode': 200,
        'body': json.dumps({"word": result}, ensure_ascii=False, default=str)
    }
