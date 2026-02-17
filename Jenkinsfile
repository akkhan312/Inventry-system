pipeline {
    agent any

    options {
        timeout(time: 15, unit: 'MINUTES')
        skipStagesAfterUnstable()
    }

    stages {
        stage('📦 Checkout') {
            steps {
                checkout scmGit(
                    branches: [[name: '*/dev']],
                    userRemoteConfigs: [[
                        credentialsId: 'dev_majid_new_github_credentials',
                        url: 'https://github.com/NartechSolution/inventory-system-N.git'
                    ]]
                )
            }
        }

        stage('Copy Environment File') {
            steps {
                echo 'Copying environment file to Backend folder...'
                bat 'if not exist \"%WORKSPACE%\\backend\" mkdir \"%WORKSPACE%\\backend\"'
                bat 'copy \"C:\\Program Files\\Jenkins\\jenkinsEnv\\inventory_system_N\\.env\" \"%WORKSPACE%\\backend\\.env\" /Y'
            }
        }

        stage('📁 Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                }
            }
        }

        stage('⚙️ Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('📁 Install Backend Dependencies') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        stage('🛑 Stop Existing Backend (if running)') {
            steps {
                dir('backend') {
                    script {
                        def status = bat(script: 'pm2 list', returnStdout: true).trim()
                        if (status.contains('inventory-system-backend')) {
                            echo 'Stopping existing PM2 process: inventory-system-backend'
                            bat 'pm2 stop inventory-system-backend || exit 0'
                            bat 'pm2 delete inventory-system-backend || exit 0'
                        }
                    }
                }
            }
        }

        stage('🛠 Generate Prisma Client') {
            steps {
                dir('backend') {
                    // ✅ Generate Prisma Client for MongoDB
                    bat 'npx prisma generate'
                }
            }
        }

        stage('⚙️ Build Backend') {
            steps {
                dir('backend') {
                    bat 'npm run build'
                }
            }
        }

        stage('🚀 Start Backend') {
            steps {
                dir('backend') {
                    bat 'pm2 start dist/server.js --name inventory-system-backend'
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment completed successfully.'
        }
        failure {
            echo '❌ Deployment failed. Please check logs for details.'
        }
    }
}
