# Contributing

Thanks for taking an interest in CampusBaazar.

## Development workflow

1. Create a branch from `main` with a short descriptive name.
2. Keep changes focused on one behavior or concern.
3. Follow the existing React and Spring Boot patterns in the project.
4. Run the relevant checks before opening a pull request.
5. Describe what changed, why it changed, and how it was tested.

## Checks

```powershell
cd frontend
npm run lint
npm run build

cd ..\backend
.\mvnw.cmd test
```

Do not commit local databases, generated build output, logs, credentials, or uploaded student files.

