# 🚀 End-to-End Argo CD GitOps Deployment Guide

## 1. Overview
This guide demonstrates how to:
- Build a Node.js application
- Containerize using Docker
- Deploy to Kubernetes
- Manage deployments using Argo CD (GitOps approach)

---

## 2. Application Code

### app.js
```js
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello from ArgoCD deployed app 🚀");
});

app.listen(3000, () => console.log("Running on port 3000"));
```

### package.json
```json
{
  "name": "argocd-demo",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

---

## 3. Docker Configuration

### Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

### Build & Push Image
```bash
docker build -t kaisarkhan1981/argocd-demo:v1 .

# If build fails (network issue)
docker build --network=host -t kaisarkhan1981/argocd-demo .

# Push image
docker push kaisarkhan1981/argocd-demo:latest
```

---

## 4. Kubernetes Manifests

### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: argocd-demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: argocd-demo
  template:
    metadata:
      labels:
        app: argocd-demo
    spec:
      containers:
      - name: argocd-demo
        image: kaisarkhan1981/argocd-demo:v1
        ports:
        - containerPort: 3000
```

### service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: argocd-demo-service
spec:
  type: NodePort
  selector:
    app: argocd-demo
  ports:
    - port: 3000
      targetPort: 3000
      nodePort: 30007
```

---

## 5. Install Argo CD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

---

## 6. Access Argo CD

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Get admin password:
```bash
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 --decode
```

---

## 7. Argo CD Application

### application.yaml
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: argocd-demo
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/kaisarkhan81/k8s-manifests
    targetRevision: HEAD
    path: .
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

8. GitHub Actions CI/CD
Mkdir –p .github/workflows
.github/workflows/docker-build.yml

name: Build and Push Docker Image
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: docker/setup-buildx-action@v3
    - uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    - run: |
        docker build -t kaisarkhan1981/argocd-demo:${{ github.sha }} .
        docker push kaisarkhan1981/argocd-demo:${{ github.sha }}
        
9. Create secret on github for docker user and tokens
Personal Access Tokens (Classic)
https://github.com/settings/tokens
Personal access tokens | Docker
https://app.docker.com/accounts/kaisarkhan1981/settings/personal-access-tokens

11. add secret docker_username and docker_password 
Projects > settings > security and quality > secrets and variables > actions > new repository secrets


12. Verification
kubectl get pods
kubectl get svc
Access app via http://<node-ip>:30007

13. Update service IP manually 

kubectl patch svc agrocd-server -n argocd -p '{"spec":{"externalIPs":["192.168.0.106"]}}'

