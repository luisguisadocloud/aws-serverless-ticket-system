#!/bin/bash

set -e

LAMBDA_NAME="lmb-ticket"
DIST_DIR="./dist"
ZIP_FILE="handlers.zip"
AWS_PROFILE="lguisadom-iamadmin"
AWS_REGION="us-east-2"

echo "➡️  Building project..."
npm run build-zip

echo "Uploading $ZIP_FILE to AWS Lambda: $LAMBDA_NAME"
aws lambda update-function-code \
  --function-name "$LAMBDA_NAME" \
  --zip-file "fileb://$DIST_DIR/$ZIP_FILE" \
  --region "$AWS_REGION" \
  --profile "$AWS_PROFILE"

echo "✅ Successful deployment of $LAMBDA_NAME"

#executable: chmod +x deploy-lambda.sh
