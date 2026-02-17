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
                        url: 'https://github.com/NartechSolution/MES_GTRACK.git'
                    ]]
                )
            }
        }

        stage('Copy Environment File') {
            steps {
                echo 'Copying environment file to Backend folder...'
                bat 'if not exist \"%WORKSPACE%\\backend\" mkdir \"%WORKSPACE%\\backend\"'
                bat 'copy \"C:\\Program Files\\Jenkins\\jenkinsEnv\\mes_gtrack\\.env\" \"%WORKSPACE%\\backend\\.env\" /Y'
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

        stage('📁 Install MES Public Site Dependencies') {
            steps {
                dir('MES_PUBLIC_SITE') {
                    bat 'npm install --legacy-peer-deps'
                }
            }
        }

        stage('⚙️ Build MES Public Site') {
            steps {
                dir('MES_PUBLIC_SITE') {
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
                        if (status.contains('mes_gtrack')) {
                            echo 'Stopping existing PM2 process: mes_gtrack'
                            bat 'pm2 stop mes_gtrack || exit 0'
                            bat 'pm2 delete mes_gtrack || exit 0'
                        }
                    }
                }
            }
        }

        stage('🛠 Update Prisma Schema') {
            steps {
                dir('backend') {
                    // ✅ Run your custom update:schema script here
                    bat 'npm run update:schema'
                }
            }
        }

        stage('🚀 Start Backend') {
            steps {
                dir('backend') {
                    bat 'pm2 start server.js --name mes_gtrack'
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
