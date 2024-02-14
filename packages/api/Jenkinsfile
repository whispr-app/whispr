pipeline {
  agent any
  tools {nodejs "NodeLTS"}
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Install deps') {
      steps {
        sh 'pnpm install'
      }
    }
    stage('Build') {
      steps {
        sh 'pnpm build'
      }
    }
    stage('Deploy') {
      steps {
        sh 'pnpm serve --domain=$DOMAIN'
      }
    }
  }
}