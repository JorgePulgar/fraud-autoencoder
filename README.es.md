# fraud-autoencoder

Detección no supervisada de fraude en tarjetas de crédito mediante un autoencoder basado en error de reconstrucción, entrenado exclusivamente con transacciones legítimas.

![Python](https://img.shields.io/badge/python-3.10%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Deploy](https://github.com/JorgePulgar/fraud-autoencoder/actions/workflows/deploy-demo.yml/badge.svg)

🇬🇧 **[Read in English](README.md)**

---

## Demo en vivo

<p align="center">
  <a href="https://JorgePulgar.github.io/fraud-autoencoder/">
    <img src="demo/src/assets/hero.png" alt="demo en vivo de fraud-autoencoder" width="320">
  </a>
</p>

<p align="center">
  <strong><a href="https://JorgePulgar.github.io/fraud-autoencoder/">→ Probar la demo en el navegador</a></strong>
</p>

La cara interactiva del proyecto. Ejecuta el autoencoder entrenado íntegramente en tu navegador — sin servidor, sin instalación, sin que tus datos salgan del dispositivo. Prueba las 6 transacciones de ejemplo (3 legítimas, 3 fraudulentas), introduce valores manualmente o sube un CSV por lotes. Arrastra el umbral para ver cómo cambia la clasificación en tiempo real.

Construido con React + Vite + ONNX Runtime Web, alojado en GitHub Pages. Código fuente en [`demo/`](demo/).

---

## TL;DR

- **Qué:** un autoencoder que detecta transacciones fraudulentas entrenándose únicamente con las *legítimas* y midiendo lo mal que reconstruye cada nueva transacción.
- **Por qué este enfoque:** en producción, los patrones de fraude evolucionan más rápido de lo que llegan las etiquetas — un modelo que necesita ejemplos etiquetados de fraude es frágil por diseño. Un autoencoder solo necesita ejemplos de comportamiento normal.
- **Resultado:** PR-AUC de **0,37** frente a **0,11** del Isolation Forest (~3× el baseline no supervisado). Una Regresión Logística supervisada llega a **0,79** — esa diferencia es el coste documentado y esperado de prescindir de etiquetas.
- **Ingeniería:** pipeline reproducible de extremo a extremo, exportación a ONNX con verificación numérica (<1e-5), y una demo estática en el navegador en GitHub Pages que ejecuta exactamente el mismo modelo en el cliente.

---

## Características principales

- **No supervisado por diseño** — el modelo nunca ve fraude durante el entrenamiento; las anomalías se detectan puramente por el error de reconstrucción.
- **Sin fuga de datos** — `StandardScaler` ajustado únicamente sobre filas legítimas de entrenamiento, garantizado por una aserción en el código.
- **Evaluación honesta** — split estratificado 70/15/15, dos estrategias de umbral reportadas (percentil 99 de los errores legítimos en validación, y F1-óptimo), PR-AUC como métrica principal (la elección correcta sobre un dataset con 0,17% de positivos).
- **Acota el rango de rendimiento** — Isolation Forest (no supervisado) por debajo, Regresión Logística (supervisada, con `class_weight='balanced'`) por encima.
- **Exportación con forma de producción** — modelo entrenado exportado a ONNX y verificado numéricamente contra PyTorch (diferencia máxima < 1e-5).
- **Demo estática en el navegador** — mismo modelo, mismo preprocesado, ejecutándose en el cliente en GitHub Pages. Sin backend, sin salida de datos.
- **Reproducible por construcción** — semillas fijas en NumPy / PyTorch / Python / scikit-learn, todos los hiperparámetros en `src/config.py`, cada script ejecutable desde la raíz del proyecto.
- **Historial de commits atómico** — desarrollo por fases, una tarea = un commit, decisiones registradas en [`DEVLOG.md`](DEVLOG.md).

---

## Tabla de contenidos

1. [Demo en vivo](#demo-en-vivo)
2. [TL;DR](#tldr)
3. [Características principales](#características-principales)
4. [Resumen del proyecto](#resumen-del-proyecto)
5. [Resultados](#resultados)
6. [¿Por qué un autoencoder?](#por-qué-un-autoencoder)
7. [Cómo funciona](#cómo-funciona)
8. [Notas de implementación](#notas-de-implementación)
9. [Cómo reproducir](#cómo-reproducir)
10. [Estructura del proyecto](#estructura-del-proyecto)
11. [Decisiones técnicas clave](#decisiones-técnicas-clave)
12. [Trabajo futuro](#trabajo-futuro)
13. [Licencia](#licencia)
14. [Autor](#autor)
15. [Summary in English](#summary-in-english)

---

## Resumen del proyecto

Este proyecto aplica un autoencoder al dataset de Kaggle Credit Card Fraud Detection (284.807 transacciones, 492 casos de fraude — 0,17% de desbalance). El modelo se entrena únicamente con transacciones legítimas y marca anomalías mediante el error de reconstrucción: las transacciones que el modelo no consigue reconstruir bien se señalan como posible fraude.

En el conjunto de test reservado, el autoencoder alcanza **PR-AUC 0,37 / ROC-AUC 0,92** sin haber visto ninguna etiqueta de fraude durante el entrenamiento. Un baseline supervisado de Regresión Logística llega a PR-AUC 0,79 — esa diferencia es esperada e intencionada (ver [¿Por qué un autoencoder?](#por-qué-un-autoencoder) más abajo). El proyecto está diseñado como ejercicio de clase y pieza de portfolio para roles de AI Engineering, priorizando calidad de ingeniería, reproducibilidad y honestidad técnica por encima del puntaje en benchmarks.

---

## Resultados

Evaluación sobre el conjunto de test (15% estratificado, umbral seleccionado en validación):

| Modelo | Precisión | Recall | F1 | PR-AUC | ROC-AUC |
|---|---|---|---|---|---|
| **Autoencoder** (umbral F1-óptimo) | 0,3469 | 0,4595 | 0,3953 | 0,3668 | 0,9228 |
| Isolation Forest | — | — | — | 0,1140 | 0,9479 |
| Regresión Logística | — | — | — | 0,7928 | 0,9677 |

Precisión/Recall/F1 se omiten para los baselines — requieren un umbral de decisión calibrado por separado, fuera de su protocolo estándar de evaluación. PR-AUC y ROC-AUC, calculados a partir de los scores brutos, son la comparación justa e independiente del umbral.

---

## ¿Por qué un autoencoder?

Sobre este dataset estático y etiquetado, un método supervisado afinado (Regresión Logística, XGBoost) superará al autoencoder en F1 bruto. **Eso es esperado e intencional.**

El autoencoder es la herramienta adecuada para el escenario realista de producción:

- Los patrones de fraude evolucionan más rápido de lo que llegan los datos etiquetados. Los nuevos vectores de ataque tienen cero ejemplos etiquetados al principio.
- Un autoencoder entrenado sobre comportamiento legítimo generaliza a *cualquier* desviación, no solo a patrones de fraude conocidos.
- No se necesitan etiquetas en el entrenamiento — el modelo puede reentrenarse continuamente sobre el flujo creciente de transacciones legítimas confirmadas.

Un clasificador supervisado fija una frontera de decisión en el momento del entrenamiento. Cuando los patrones de fraude cambian, se degrada silenciosamente. Este proyecto modela deliberadamente el caso no supervisado para hacer visible ese trade-off.

El ROC-AUC de **0,92** (frente a 0,97 de la Regresión Logística) muestra que el modelo tiene una fuerte calidad de ranking sin acceso a etiquetas. La diferencia en PR-AUC es el coste documentado y esperado de la elección no supervisada.

[⬆ Volver al inicio](#fraud-autoencoder)

---

## Cómo funciona

Un autoencoder es una red neuronal que aprende a **comprimir su entrada a través de un cuello de botella estrecho y luego reconstruirla**. La arquitectura usada aquí es simétrica: `30 → 20 → 14 → 7 → 14 → 20 → 30`. Treinta features de entrada (V1–V28 más `Time` y `Amount`) se comprimen en 7 unidades latentes y luego se expanden de vuelta a 30.

El truco: el modelo se entrena **únicamente con transacciones legítimas**, usando el error cuadrático medio entre entrada y reconstrucción como pérdida. Como el cuello de botella no puede contener toda la información original, la red se ve forzada a aprender la estructura latente más informativa del comportamiento *normal* — y solo del normal.

En inferencia, cada nueva transacción se pasa por la red y el error de reconstrucción (MSE sobre las 30 features) se convierte en el score de anomalía:

- **Error bajo** → la transacción se parece a los patrones aprendidos durante el entrenamiento → probablemente legítima.
- **Error alto** → la transacción se desvía del manifold legítimo → probablemente fraude.

Un umbral sobre ese score lo convierte en una decisión binaria. Como el modelo nunca ha visto fraude durante el entrenamiento, generaliza a *cualquier* comportamiento anómalo, no solo a los patrones de ataques previamente etiquetados.

[⬆ Volver al inicio](#fraud-autoencoder)

---

## Notas de implementación

Detalles sutiles pero importantes que no caben en una descripción de una línea:

- **Los fraudes del split de entrenamiento se excluyen deliberadamente.** Tras el split estratificado 70/15/15, el conjunto de entrenamiento contiene aproximadamente 344 filas de fraude. Esas se descartan antes de entrenar. Incluirlas dejaría que la red aprendiera también a reconstruir fraude, colapsando la señal misma de la que dependemos en inferencia. Este filtrado se aplica y se valida con una aserción en `src/data.py`.
- **La pérdida de validación se calcula solo sobre las filas legítimas de validación.** El early stopping observa la pérdida de reconstrucción sobre el subconjunto legítimo de validación, no sobre todo el conjunto. Si incluyéramos filas de fraude, penalizaríamos a la red por *no conseguir* reconstruirlas correctamente — exactamente la señal equivocada.
- **PR-AUC es la métrica principal, no ROC-AUC ni accuracy.** Con un 0,17% de tasa de positivos, ROC-AUC se infla por la abrumadora cantidad de verdaderos negativos fáciles, y accuracy carece de sentido (predecir constantemente "legítimo" da un 99,83%). PR-AUC refleja precisión y recall sobre la clase positiva rara y es la comparación honesta.
- **El ajuste del umbral nunca toca el conjunto de test.** Ambos umbrales (percentil 99 de los errores legítimos en validación, y F1-óptimo) se seleccionan en validación y se congelan antes de cualquier evaluación en test.
- **La exportación a ONNX está verificada numéricamente.** `src/export_onnx.py` exporta el modelo entrenado de PyTorch a ONNX y comprueba que las salidas de ONNX-Runtime coincidan con las de PyTorch dentro de 1e-5 sobre el conjunto de validación. Sin esa comprobación, "tenemos un archivo ONNX" no es lo mismo que "tenemos un modelo ONNX funcional".
- **La demo del navegador ejecuta exactamente los mismos artefactos.** La app de `demo/` carga el mismo modelo `.onnx` y las mismas estadísticas del scaler (exportadas como JSON) que usa el script de evaluación en Python. La inferencia ocurre íntegramente en el cliente vía ONNX Runtime Web.
- **La disciplina de ingeniería forma parte del entregable.** El desarrollo siguió un plan por fases (`tasks/PHASES.md`), una tarea por commit atómico con mensajes convencionales (`feat:`, `fix:`, `docs:`, etc.). Las incidencias encontradas durante la construcción están documentadas en [`DEVLOG.md`](DEVLOG.md). La intención es que un revisor pueda leer el git log y reconstruir todo el historial de decisiones.

[⬆ Volver al inicio](#fraud-autoencoder)

---

## Cómo reproducir

```bash
git clone <repo-url>
cd fraud-autoencoder
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Descarga creditcard.csv desde Kaggle y colócalo en:
# data/raw/creditcard.csv
# https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud

python -m src.train
python -m src.evaluate
python -m src.export_onnx
```

Los scripts son ejecutables desde la raíz del proyecto. Todos los hiperparámetros viven en `src/config.py`. Las semillas están fijadas (`random_state=42`) para una reproducibilidad completa.

Tiempos esperados en CPU: `train` ~5 min (86 epochs, early stop), `evaluate` ~20 s, `export_onnx` ~3 s.

[⬆ Volver al inicio](#fraud-autoencoder)

---

## Estructura del proyecto

```
fraud-autoencoder/
├── CLAUDE.md                  # Comportamiento siempre cargado para Claude Code
├── CONTEXT.md                 # Spec del proyecto y decisiones bloqueadas
├── WORKFLOW.md                # Protocolo de sesión para Claude Code
├── DEVLOG.md                  # Registro continuo de incidencias y resoluciones
├── README.md                  # README en inglés
├── README.es.md               # Este archivo
├── requirements.txt
├── .gitignore
├── tasks/
│   ├── PHASES.md              # Hoja de ruta
│   └── PHASE_N_*.md           # Checklists de cada fase
├── data/
│   └── raw/                   # creditcard.csv (gitignored — descarga manual)
├── models/                    # Artefactos guardados (gitignored)
├── notebooks/
│   ├── 01_eda.ipynb           # Análisis exploratorio
│   └── 02_results.ipynb       # Resultados, figuras y análisis
├── src/
│   ├── config.py              # Hiperparámetros, rutas, semillas
│   ├── data.py                # Carga, split, escalado
│   ├── model.py               # Arquitectura del autoencoder
│   ├── train.py               # Script de entrenamiento
│   ├── evaluate.py            # Script de evaluación
│   ├── baselines.py           # Isolation Forest + Regresión Logística
│   └── export_onnx.py         # Exportación a ONNX y verificación numérica
├── demo/                      # Demo en navegador (React + ONNX Runtime Web)
└── reports/
    ├── results.md             # Tabla comparativa
    └── figures/               # Curvas de entrenamiento, distribución de errores, PR/ROC
```

[⬆ Volver al inicio](#fraud-autoencoder)

---

## Decisiones técnicas clave

- **Autoencoder FC simétrico `30→20→14→7→14→20→30`** — totalmente conectado, activaciones ReLU en capas ocultas, salida lineal; sin batch norm ni dropout, lo que mantiene la exportación a ONNX simple y el comportamiento en inferencia determinista.
- **Cuello de botella de 7 unidades** — comprime las 30 features ~4,3×, forzando a la red a aprender la estructura del comportamiento legítimo en lugar de memorizarlo.
- **Pérdida MSE de reconstrucción, optimizador Adam (lr=1e-3), batch size 256** — el setup más simple y defendible para un objetivo de reconstrucción tipo regresión.
- **Early stopping (patience=5) sobre la pérdida de validación legítima-only** — ver [Notas de implementación](#notas-de-implementación).
- **StandardScaler ajustado únicamente sobre transacciones legítimas del entrenamiento** — sin fuga de datos; el scaler nunca ve validación ni test, ni etiquetas de fraude.
- **Split estratificado 70/15/15 train/val/test** — los casos de fraude aparecen en las tres divisiones, así las métricas de validación y test son significativas pese al desbalance severo.
- **Dos estrategias de umbral reportadas** — percentil 99 de los errores legítimos en validación (estilo producción, con presupuesto fijo de revisión) y F1-óptimo (mejor trade-off precisión/recall). El F1-óptimo se usa para el número titular de test.
- **Baselines: Isolation Forest (`contamination=0.0017`) y Regresión Logística (`class_weight='balanced'`)** — uno no supervisado, otro supervisado, acotando el rango de rendimiento esperado.

[⬆ Volver al inicio](#fraud-autoencoder)

---

## Trabajo futuro

- **Baseline supervisado: XGBoost** — para establecer el techo completo de rendimiento en este dataset
- **Autoencoder variacional / denoising** — un manifold latente más estrecho reduciría falsos positivos sobre transacciones inusuales-pero-legítimas
- **Ajuste de umbral sensible al coste** — reemplazar el umbral F1-óptimo por uno derivado de una matriz de costes financiera (coste de un fraude no detectado >> coste de una falsa alarma)
- **Manejo de concept drift** — reentrenamiento periódico sobre una ventana móvil de transacciones legítimas confirmadas
- **Ensemble de autoencoders con distintas semillas** — promediar los errores de reconstrucción a través de varias semillas para reducir la varianza del score sobre eventos raros

[⬆ Volver al inicio](#fraud-autoencoder)

---

## Licencia

MIT — ver [LICENSE](LICENSE).

[⬆ Volver al inicio](#fraud-autoencoder)

---

## Autor

**Jorge Pulgar** — Junior AI Engineer, Madrid

- GitHub: [github.com/jpulgar](https://github.com/jpulgar)
- LinkedIn: [linkedin.com/in/jpulgar](https://linkedin.com/in/jpulgar)

[⬆ Volver al inicio](#fraud-autoencoder)

---

## Summary in English

This project applies an autoencoder to detect credit card fraud in an unsupervised way: the model is trained only on legitimate transactions and flags as suspicious those it cannot reconstruct well. The dataset is the Kaggle "Credit Card Fraud Detection" (ULB), with 284,807 transactions and an extreme 0.17% fraud imbalance. The model achieves PR-AUC 0.37 and ROC-AUC 0.92 with zero label exposure during training. The unsupervised approach is a deliberate design choice: in real production, fraud patterns evolve faster than labels arrive, and an autoencoder can detect any deviation from legitimate behaviour without needing prior fraud examples.

For the full English README, see [README.md](README.md).

[⬆ Volver al inicio](#fraud-autoencoder)
