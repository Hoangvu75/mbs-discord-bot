pipeline {
  agent any
  environment {
    IMAGE_NAME = 'mbs-discord-bot'
    HARBOR_HOST = 'harbor.hoangvu75.space'
    HARBOR_PROJECT = 'library'
    MANIFEST_REPO = 'https://github.com/Hoangvu75/k8s_manifest.git'
    VALUES_PATH = 'apps/playground/mbs-discord-bot/chart/values.yaml'
  }
  options {
    buildDiscarder(logRotator(numToKeepStr: '5'))
  }
  stages {
    stage('Build, Scan, Push') {
      steps {
        script {
          env.IMAGE_TAG = env.GIT_COMMIT?.take(7) ?: 'latest'
          def imageFull = "${env.HARBOR_HOST}/${env.HARBOR_PROJECT}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
          podTemplate(containers: [
            containerTemplate(name: 'kaniko', image: 'gcr.io/kaniko-project/executor:v1.23.0-debug', command: 'sleep', args: '99d', ttyEnabled: true),
            containerTemplate(name: 'trivy', image: 'aquasec/trivy:latest', command: 'sleep', args: '99d', ttyEnabled: true),
            containerTemplate(name: 'skopeo', image: 'quay.io/skopeo/stable:latest', command: 'sleep', args: '99d', ttyEnabled: true)
          ]) {
            node(POD_LABEL) {
              checkout scm
              withCredentials([usernamePassword(credentialsId: 'harbor-credentials', usernameVariable: 'HARBOR_USER', passwordVariable: 'HARBOR_PASS')]) {
                // 1. Kaniko: build to tar (chưa push)
                container('kaniko') {
                  sh """
                    /kaniko/executor -f \${WORKSPACE}/Dockerfile -c \${WORKSPACE} \
                      --tarPath=\${WORKSPACE}/image.tar --no-push
                  """
                }
                // 2. Trivy: scan tar trong workspace (không cần pull)
                container('trivy') {
                  sh """
                    trivy image --no-progress --exit-code 0 \
                      --input \${WORKSPACE}/image.tar
                  """
                }
                // 3. Skopeo: push tar lên Harbor (chỉ khi scan pass)
                container('skopeo') {
                  sh """
                    skopeo copy --dest-creds="\${HARBOR_USER}:\${HARBOR_PASS}" \
                      docker-archive:\${WORKSPACE}/image.tar docker://${imageFull}
                  """
                }
              }
            }
          }
        }
      }
    }

    stage('Update Manifest (GitOps)') {
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: 'github-credentials', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
            sh """
              rm -rf k8s_manifest || true
              REPO_URL=\$(echo "${env.MANIFEST_REPO}" | sed "s|https://|https://\\${GIT_USER}:\\${GIT_TOKEN}@|")
              git clone \$REPO_URL k8s_manifest
              cd k8s_manifest
              sed -i 's/tag: ".*"/tag: "${env.IMAGE_TAG}"/' ${env.VALUES_PATH}
              git config user.email "jenkins@ci.local"
              git config user.name "Jenkins CI"
              git add ${env.VALUES_PATH}
              git commit -m "chore: update ${env.IMAGE_NAME} image tag to ${env.IMAGE_TAG}" || echo "No changes to commit"
              git push origin master
            """
          }
        }
      }
    }
    stage('Cleanup Old Images (Harbor)') {
      steps {
        script {
          withCredentials([usernamePassword(credentialsId: 'harbor-credentials', usernameVariable: 'HARBOR_USER', passwordVariable: 'HARBOR_PASS')]) {
            sh '''
              KEEP_COUNT=2
              API_URL="https://${HARBOR_HOST}/api/v2.0/projects/${HARBOR_PROJECT}/repositories/${IMAGE_NAME}/artifacts"
              
              # Get all artifacts sorted by push_time desc (parse digest with grep/sed)
              RESPONSE=$(curl -s -u "${HARBOR_USER}:${HARBOR_PASS}" "${API_URL}?page_size=100&sort=-push_time")
              ARTIFACTS=$(echo "$RESPONSE" | grep -o '"digest":"sha256:[^"]*"' | sed 's/"digest":"//g' | sed 's/"//g')
              
              # Count and delete old ones
              COUNT=0
              for DIGEST in $ARTIFACTS; do
                COUNT=$((COUNT + 1))
                if [ $COUNT -gt $KEEP_COUNT ]; then
                  echo "Deleting old artifact: $DIGEST"
                  curl -s -X DELETE -u "${HARBOR_USER}:${HARBOR_PASS}" "${API_URL}/${DIGEST}" || true
                fi
              done
              
              echo "Cleanup complete. Kept $KEEP_COUNT most recent images."
            '''
          }
        }
      }
    }
  }
  post {
    always {
      sh """
        curl -X POST "https://n8n.hoangvu75.space/webhook/jenkins-notify" \
          -H "Content-Type: application/json" \
          -d '{"job_name":"${env.JOB_NAME}","build_number":"${env.BUILD_NUMBER}","build_url":"${env.BUILD_URL}","status":"${currentBuild.currentResult}"}'
      """
    }
  }
}


