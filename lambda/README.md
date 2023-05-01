## Preparation
API gateway is used with proxy integration to lambda.

For numpy dependency default AWS layer `AWSSDKPandas-Python39` is used (I've tried including numpy directly ito ZIP as described in [AWS documentation](https://docs.aws.amazon.com/lambda/latest/dg/python-package.html), section `Deployment package with dependencies`, but it didn't work).

Don't forget to give lambda permissions to access DynamoDB.

To deploy lambdas you have to use AWS CLI profile with corresponding permissions.

### Getting words in the order of similarity to specified one
```commandline
curl -X GET -G "https://j8t13egmj6.execute-api.us-east-1.amazonaws.com/prod/words/most-similar" --data-urlencode "word=клопат"
```

### Create new game with the specified word as the one to guess
*Potentially costly operation, so currently disabled via public API. Invoking directly on lambda.* 

word - the word to guess in the game

game - the name of the game, must be unique
```commandline
curl -X POST -G "https://j8t13egmj6.execute-api.us-east-1.amazonaws.com/prod/games" --data-urlencode "word=клопат" --data-urlencode "game=test1"
```

### Guessing the word in the game
```commandline
curl -X GET -G "https://j8t13egmj6.execute-api.us-east-1.amazonaws.com/prod/games/test2/rank" --data-urlencode "word=чалавек"
```