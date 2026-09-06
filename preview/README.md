# preview/ — vistas previas estáticas

Fichas **congeladas** de productos que todavía no están en producción (hoy: los cinco de
acciones). Cada una lleva un banner fijo con la fecha de generación, no vence (se anuló
el `VALID_UNTIL`), tiene `noindex` y **no entra a `catalog.json` ni al MCP**: `catalog.py`
solo mira `latest/`.

- Se publican a mano desde las fichas preliminares del Drive (`referencias/*-preliminar/`).
- Cuando un producto entra a la corrida automática, su ficha aparece en `latest/` y la
  copia de acá se borra en el mismo commit.
- `latest/` sigue siendo la única fuente de lo publicado.
