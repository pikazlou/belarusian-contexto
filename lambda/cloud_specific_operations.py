import boto3
from utils import parse_word2vec_format


def get_embeddings() -> dict:
    embedding_local_file = '/tmp/embeddings'
    s3 = boto3.resource('s3')
    s3.Bucket('belarus-embedding').download_file('word2vec-100-bel-cc100.vectors', embedding_local_file)
    with open(embedding_local_file) as file:
        emb = parse_word2vec_format(file)
    return emb


def put_words_order_for_game(game: str, words: list[str]) -> None:
    pk = f'GAME#{game}'
    db = boto3.resource('dynamodb', region_name='us-east-1')
    table = db.Table('belarusian-contexto')
    with table.batch_writer() as batch:
        for index, word in enumerate(words):
            batch.put_item(
                Item={
                    'pk': pk,
                    'sk': word,
                    'rank': index,
                }
            )


def get_word_rank(game: str, word: str) -> int:
    pk = f'GAME#{game}'
    db = boto3.resource('dynamodb', region_name='us-east-1')
    table = db.Table('belarusian-contexto')
    response = table.get_item(
        Key={
            'pk': pk,
            'sk': word
        }
    )
    if response.get('Item') is None or response.get('Item').get('rank') is None:
        return -1
    return response['Item']['rank']
