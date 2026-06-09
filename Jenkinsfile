pipeline {
  agent any

  environment {
    DEPLOY_DIR = '/opt/ui-app/apisrv'
    PM2_APP_NAME = 'ui-app-apisrv'
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }
    stage('Build') {
      steps {
        sh 'npm run build:apisrv'
      }
    }
    stage('Deploy') {
      steps {
        sh 'chmod +x scripts/jenkins-deploy.sh'
        sh 'SKIP_BUILD=1 ./scripts/jenkins-deploy.sh'
      }
    }
  }

  post {
    success {
      echo 'API 部署成功'
    }
    failure {
      echo '部署失败，查看 Jenkins 日志'
    }
  }
}
