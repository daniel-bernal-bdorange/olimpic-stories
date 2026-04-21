# Automatizacion de tareas en Azure DevOps

Este proyecto incluye un script para crear automaticamente el backlog inicial:

- 1 Epic
- 4 Features
- 12 Tasks (3 por Feature)

## Archivo

- `scripts/create-ado-work-items.ps1`

## Requisitos

1. Tener permisos en Azure DevOps para crear Work Items.
2. Crear un PAT (Personal Access Token) con alcance de `Work Items (Read & write)`.
3. PowerShell 5.1+ (o PowerShell 7+).

## Uso rapido

```powershell
cd C:\dev\olympic-data-story

.\scripts\create-ado-work-items.ps1 `
  -Organization "tu-organizacion" `
  -Project "tu-proyecto" `
  -Pat "tu_pat"
```

## Uso con AreaPath e IterationPath (opcional)

```powershell
.\scripts\create-ado-work-items.ps1 `
  -Organization "tu-organizacion" `
  -Project "tu-proyecto" `
  -Pat "tu_pat" `
  -AreaPath "tu-proyecto\\DataStory" `
  -IterationPath "tu-proyecto\\Sprint 1"
```

## Recomendaciones

- No guardes el PAT en commits ni archivos del repo.
- Si lo prefieres, define el PAT en una variable de entorno y pasalo al script:

```powershell
$env:AZDO_PAT = "tu_pat"
.\scripts\create-ado-work-items.ps1 -Organization "tu-org" -Project "tu-proyecto" -Pat $env:AZDO_PAT
```
