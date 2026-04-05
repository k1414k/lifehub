name: Deploy on EC2

on:
  push:
    branches: [main]

concurrency:
  group: deploy-prod
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: self-hosted
    steps:
      - name: Deploy
        run: |
          set -e
          sudo -u ec2-user /home/ec2-user/projects/deploy.sh