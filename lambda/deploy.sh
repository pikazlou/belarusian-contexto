for lambda in contextoLambdaCreateGame contextoLambdaMostSimilarWords
do
  (
  zip -j deployment-package.zip $lambda/lambda_function.py cloud_specific_operations.py utils.py
  aws lambda update-function-code --profile personal-lambda --region us-east-1 --function-name $lambda --zip-file fileb://deployment-package.zip
  rm deployment-package.zip
  )
done