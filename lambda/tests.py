import unittest
import numpy as np
from utils import parse_word2vec_format, cos_similarity, words_by_distance


class TestVectorOperations(unittest.TestCase):

    def test_parsing_word2vec(self):
        text = "3 3\nбеларускі -2.473976 -1.3303756 -0.14021018\n" \
               "год -2.6074343 1.2617594 1.629136\n" \
               "мова 3.036587 -1.5735155 2.4070292"
        embeddings = parse_word2vec_format(iter(text.splitlines()))
        self.assertEqual(len(embeddings), 3)
        self.assertListEqual(list(embeddings.get('беларускі')), [-2.473976, -1.3303756, -0.14021018])
        self.assertListEqual(list(embeddings.get('год')), [-2.6074343,  1.2617594,  1.629136])
        self.assertListEqual(list(embeddings.get('мова')), [3.036587, -1.5735155,  2.4070292])

    def test_cos_similarity_same_direction(self):
        vec1 = np.array([1.3, -2.1, 0.1])
        vec2 = vec1 * 2
        self.assertEqual(cos_similarity(vec1, vec2), 1.0)

    def test_cos_similarity_opposite_direction(self):
        vec1 = np.array([1.3, -2.1, 0.1])
        vec2 = vec1 * -2
        self.assertEqual(cos_similarity(vec1, vec2), -1.0)

    def test_cos_similarity_orthogonal(self):
        vec1 = np.array([1.0, -2.1, 0.0])
        vec2 = np.array([0.0, 0.0, 3.2])
        self.assertEqual(cos_similarity(vec1, vec2), 0.0)

    def test_words_by_distance_unknown_word(self):
        embeddings = {
            'беларусь': [1.0, 2.0],
            'чалавек': [2.0, 1.0]
        }
        self.assertListEqual(words_by_distance(embeddings, 'мова'), [])

    def test_words_by_distance(self):
        embeddings = {
            'чалавек': [0.0, 1.0],
            'беларусь': [1.0, 0.0],
            'мова': [0.9, 0.1]
        }
        self.assertListEqual(words_by_distance(embeddings, 'мова'), ['мова', 'беларусь', 'чалавек'])


if __name__ == '__main__':
    unittest.main()
