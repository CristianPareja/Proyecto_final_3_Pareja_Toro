# Arquitectura por capas

## controladores
capa que va directamente contra el cliente

## servicios
- logica de negocio
-realizar validaciones
- orquestar operaciones
- lanzar excepciones de negocio

## repositories
- acceso a los datos
- operaciones CRUD basicas
- DEBE ser indpendiente de la logica de negocio

En esta arquitectura, cada capa tiene una responsabilidad

# trabajanod con node:
- capa controladores es la capa de rutas
- services -> services
- repositories -> repositories

