pipeline {
  agent any

  environment {
    PM2_APP = 'ui-app-apisrv'
    // Jenkins 已通过 SCM 检出代码时可跳过 git pull
    // SKIP_GIT_PULL = '1'
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  stages {
    stage('Deploy') {
      steps {
        script {
          if (isUnix()) {
            sh 'node scripts/jenkins-deploy.mjs'
          } else {
            bat 'node scripts\\jenkins-deploy.mjs'
          }
        }
      }
    }
  }

  post {
    success {
      echo '部署成功'
    }
    failure {
      echo '部署失败，请查看上方日志'
    }
  }
}
