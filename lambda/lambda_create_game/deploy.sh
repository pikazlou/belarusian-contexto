zip deployment-package.zip lambda_function.py ../utils.py ../cloud_specific_operations.py
aws lambda update-function-code --profile personal-lambda --region us-east-1 --function-name contextoLambdaCreateGame --zip-file fileb://deployment-package.zip
rm deployment-package.zip