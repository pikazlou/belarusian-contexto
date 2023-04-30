rm my-deployment-package.zip
zip my-deployment-package.zip lambda_function.py ../utils.py
aws lambda update-function-code --profile personal-lambda --region us-east-1 --function-name contextoLambdaMostSimilarWords --zip-file fileb://my-deployment-package.zip