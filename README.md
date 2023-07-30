This repo contains two implementations: serverless with lambdas and server-based with flask
It turned out lambda appoach is cumbersome and not cost-effective. 
So the preferred approach is using server-based.

Steps:
1. Set up environment, either through requirements file
```commandline
conda create -n <environment-name> --file requirements.txt
```
or just providing needed packages
```commandline
conda create --name <environment-name> python=3.9 boto3 gensim flask waitress
```

2. Activate the environment

3. Start REST service
```commandline
cd rest-service
python routes.py <word2vec vectors file>
```