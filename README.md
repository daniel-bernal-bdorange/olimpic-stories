# Olympic Data Story

Proyecto web para concurso de visualizacion de datos olimpicos con narrativa scrollytelling y estilo editorial.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- En siguientes iteraciones: D3.js / Observable Plot y animaciones

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir en `http://localhost:3000`.

## Rutas actuales

- `/`
- `/cold-war-in-gold`
- `/atlas-cuerpo-olimpico`
- `/cementerio-olimpico`
- `/10-olimpiadas-una-vida`

## Contexto de continuidad

La referencia de decisiones del proyecto esta en `docs/project-context.md`.

## Skills compartidas

El proyecto versiona skills de agente en `.agents/skills/` junto con `skills-lock.json`.

Esto permite que el workflow de GitHub Copilot en este repo sea compartido y reproducible para cualquier persona que abra el workspace, en lugar de depender de instalaciones locales no versionadas.

## Backlog en Azure DevOps

Hay un script para crear Epic/Features/Tasks automaticamente:

- `scripts/create-ado-work-items.ps1`
- Guia de uso: `docs/azure-devops-automation.md`
