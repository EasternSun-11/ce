pipeline {
  agent any

  tools {
    nodejs 'v24'
  }

  environment {
    DEPLOY_DIR_APISRV = '/opt/ui-app/apisrv'
    DEPLOY_DIR_ADMIN = '/opt/ui-app/admin'
    DEPLOY_DIR_CLIENT = '/opt/ui-app/client'
    SKIP_PM2 = '1'
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
        sh '''
          npm ci || npm i
          # lock 在 Windows 生成时，Linux CI 上 npm ci 可能漏装 rollup 原生包
          npm install @rollup/rollup-linux-x64-gnu @rollup/rollup-linux-x64-musl --no-save
        '''
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build:apisrv'
        sh 'npm run build:admin'
        sh 'npm run build:client'
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
      echo "部署成功: apisrv=${DEPLOY_DIR_APISRV}, admin=${DEPLOY_DIR_ADMIN}, client=${DEPLOY_DIR_CLIENT}"
    }
    failure {
      echo '流水线执行失败，请查看上方日志'
    }
    always {
      cleanWs()
    }
  }
}
