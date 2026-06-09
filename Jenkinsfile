pipeline {
  agent any

  tools {
    nodejs 'v24'
  }

  environment {
    DEPLOY_DIR = '/opt/ui-app/apisrv'
    PM2_APP_NAME = 'ui-app-apisrv'
  }

  triggers {
    githubPush()
  }

  options {
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 30, unit: 'MINUTES')
  }

  stages {
    stage('Install') {
      steps {
        sh 'node -v && npm -v'
        sh 'npm ci || npm i'
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
      echo "API 部署成功: ${DEPLOY_DIR}"
    }
    failure {
      echo '流水线执行失败，请查看上方日志'
    }
    always {
      cleanWs()
    }
  }
}
