# Frontend

## Struktur erklärung

### core/
Alles was es nur einmal gibt

#### core/models
DTOs für das Backend

#### core/services
API-services

#### core/intercesptors
- JWT automatisch mitsenden
- Error Handiling

#### core/guards
- schützen Routen für mehr Sicherheit

### shared/
Alles was in mehreren Features benutzt wird
bsp. Buttons, Dialog etc.

### features/
Jedes feature bekommt einen eigenen Ordner
bsp. auth, projects, board etc.
