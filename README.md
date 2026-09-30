# Mora Design · Sistema de contenido para Instagram

Sistema automático que cada mañana investiga tendencias de Instagram y genera un **pack de contenido en inglés orientado a ventas** para @jordimoradesign: carrusel listo para subir (PNG), 2 guiones de Reel, secuencia de stories y plantilla de DM. Todo está pensado para el embudo **Reel → perfil → link con UTM → web → llamada/formulario → venta**.

Este repositorio es privado y **no se publica en la web**. La web (`jordi-web`) no se toca.

## Qué recibes cada día (≈ 07:00, hora de Zúrich)
En `output/AAAA-MM-DD/`:
| Archivo | Qué es |
|---|---|
| `slides/01.png … 0N.png` | Carrusel 1080×1350 con la identidad de la web (negro, lima, Inter) |
| `slides/reel-cover-A.png`, `-B.png` | Portadas de los reels (grid limpio) |
| `pack.md` | Resumen en español + caption, first comment, hashtags, alt text, guiones de Reel A (tendencia) y B (autoridad/demo) con tabla de planos, stories, plantilla DM, checklist |
| `visuals.md` | Prompts de Higgsfield (o estado de las imágenes generadas) |
| `weekly-report.md` | Solo los lunes: análisis semanal |

Te llega una notificación con las slides y el `pack.md`. Tú revisas y publicas:
**12:15 carrusel · 18:30 Reel A · stories repartidas en el día · responde los comentarios con la palabra clave en menos de 1 h.**

## Automatización
Rutina de Claude Code **"Mora Design · pack diario de Instagram"**, todos los días a las **06:52 (Europe/Zurich)**. Abre una sesión nueva en la nube, clona este repo, ejecuta `.claude/skills/daily-pack/SKILL.md`, hace push a `main` y te envía las slides y el `pack.md` con notificación push. Los lunes añade la revisión semanal.
Puedes pausarla, cambiar la hora o lanzarla a mano desde claude.ai/code → Routines.

## Antes de empezar (una sola vez)
1. Optimiza el perfil siguiendo `strategy/profile.md` (nombre buscable, bio, link con UTM, highlights, posts fijados).
2. Lee `strategy/funnel.md`: el motor de leads es la **palabra clave en comentarios → DM → auditoría gratis de 3 min (Loom) → llamada de 20 min**.

## Activar Higgsfield (cuando tengas la API key)
1. Crea la API key en https://cloud.higgsfield.ai/api-keys.
2. En Claude Code (web) → menú del entorno → **Editar**:
   - **Variables/secretos**: `HF_KEY=tu_api_key:tu_api_secret`
   - **Acceso de red**: añade `api.higgsfield.ai` y `*.higgsfield.ai` (y el dominio del CDN de imágenes si la primera generación falla en la descarga; aparecerá en `visuals.md`).
3. Opcional: `HF_IMAGE_MODEL` para cambiar de modelo (por defecto `bytedance/seedream/v4/text-to-image`).
Sin clave, el sistema sigue funcionando: las slides salen con diseño tipográfico y los prompts quedan en `visuals.md` para pegarlos en higgsfield.ai.

## Métricas (cada lunes, 5 minutos)
Añade una fila a `data/metrics.csv` con los datos de la semana: Instagram Insights (alcance, % no seguidores, guardados, compartidos, visitas al perfil, clics en enlace), comentarios con palabra clave, DMs, formularios (Formspree), llamadas (Cal.com), propuestas, ventas. En cada llamada pregunta "¿cómo me encontraste?". El análisis del lunes ajusta la estrategia con esos datos.

## Uso manual
Abre una sesión de Claude Code con este repo y di:
- "genera el pack de hoy" · "haz un carrusel sobre X para peluquerías" · "3 ideas de reels con la tendencia de esta semana" · "revisión semanal".

## Estructura
```
brand/       identidad, voz, oferta, reglas de prueba social, fuentes
strategy/    embudo, pilares, calendar.json, hooks y CTAs, perfil, aprendizajes
.claude/     skills (procesos) y agents (trend-scout, copywriter, analyst)
tools/       render de slides, Higgsfield, UTM, plan del día, control de calidad, log
research/    tendencias diarias (JSON)
output/      packs diarios
data/        historial de contenido y métricas
```
