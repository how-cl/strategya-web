# strategya-web

Hosting público (GitHub Pages) de las **fichas de producto** de Strategya.pro y del
índice que las lista.

🔗 Vitrina: https://strategya.pro/catalog
🔗 Origen de los archivos: https://how-cl.github.io/strategya-web/latest/

> **Backtest simulado** — no representa performance real ni constituye asesoría de
> inversión.

## Qué hay acá

```
latest/
  <slug>.html          ficha del producto, autocontenida (CSS y JS inline)
  <slug>.signal.json   la señal del producto, contrato strategya.signal/0.2
  catalog.json         índice que consume /catalog, contrato strategya.catalog/0.1
index.html             redirección a strategya.pro/catalog
```

Cada ficha lleva su propia fecha visible y **se rotula `SEÑAL VENCIDA` por sí sola**
pasado su `valid_until_utc`. Es a propósito: una URL con nombre estable seguiría
sirviendo una señal vieja con cara de actual si el pipeline muriera.

## Quién escribe acá

Nadie a mano. Lo publica `signals/publish.py` desde el repo privado
`strategya-data`, disparado por el workflow `signals.yml` después de cada cierre de
vela (00:05 y 12:05 UTC). Ese publicador tiene un portero: valida schema, checksum,
pesos, vencimiento y el MD5 del `.pine` contra el manifiesto. **Lo que no pasa, no
se publica.**

## Historia

Hasta el 31-ago-2026 la raíz de este repo servía el dashboard del **EVOL Conductor
v1.3**, un producto anterior que se retiró. Sus archivos (`app.js`, `styles.css`,
`track_record.json`) salieron del repo; siguen en el historial de git.
