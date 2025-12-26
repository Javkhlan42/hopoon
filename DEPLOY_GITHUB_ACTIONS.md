# GitHub Actions ашиглан Admin Web Deploy хийх

## 1. GitHub Repository үүсгэх

```
1. GitHub.com руу нэвтрэх
2. Repositories > New дарах
3. Repository name: hop-on-deploy
4. Private сонгох
5. Create repository дарах
```

## 2. AWS Credentials нэмэх

Repository Settings > Secrets and variables > Actions > New repository secret

Дараах 2 secret нэмнэ:
- **Name:** `AWS_ACCESS_KEY_ID`
  **Value:** AKIAQXQSZJPJJFSVDYHO

- **Name:** `AWS_SECRET_ACCESS_KEY`  
  **Value:** Та өөрийн AWS secret key-г оруулна

## 3. Code Push хийх

PowerShell дээр дараах командуудыг ажиллуулна:

```powershell
cd C:\Users\user\Desktop\hopooon\hop-on

# Git init (хэрэв хийгээгүй бол)
git init
git add .
git commit -m "Initial commit with GitHub Actions workflow"

# Remote repository нэмэх (таны GitHub repo URL-г оруулна)
git remote add origin https://github.com/YOUR_USERNAME/hop-on-deploy.git

# Push хийх
git branch -M main
git push -u origin main
```

## 4. GitHub Actions ажиллуулах

1. GitHub repository > Actions таб руу очих
2. "Build and Deploy Admin Web" workflow сонгох
3. "Run workflow" дарах
4. API Gateway URL шалгаад "Run workflow" товч дарах
5. 5-10 минутын дараа дуусна

## 5. Үр дүн шалгах

Workflow амжилттай дууссаны дараа:

```powershell
# Admin-web pods шалгах
kubectl get pods -n hopon -l app=admin-web

# Login хуудас нээх
start http://a89d35679920b414fa68be9927f2922e-1855982853.ap-southeast-1.elb.amazonaws.com:3100/login
```

## Давуу тал

- ✅ 7GB RAM (local 2-4GB-аас илүү)
- ✅ NPM cache хадгална (2-3 дахин хурдан)
- ✅ Docker BuildKit cache ашигладаг
- ✅ Автоматаар ECR руу push хийнэ
- ✅ Kubernetes deployment автоматаар restart хийнэ
- ✅ 5-10 минутад бүх зүйл дуусна
