### Getting words in the order of similarity to specified one
```commandline
curl -X GET -G "https://j8t13egmj6.execute-api.us-east-1.amazonaws.com/prod/words/most-similar" --data-urlencode "word=клопат"
```

### Create new game with the specified word as the one to guess
word - the word to guess in the game

game - the name of the game, must be unique
```commandline
curl -X POST -G "https://j8t13egmj6.execute-api.us-east-1.amazonaws.com/prod/games" --data-urlencode "word=клопат" --data-urlencode "game=test1"
```