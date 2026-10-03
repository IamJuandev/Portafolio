# Reorganización del Portafolio — Juan Gabriel Alfonso Rojas

> Documento de trabajo para actualizar `index.html` **y** `agent/portfolio-facts.json`
> (el asistente IA del portafolio responde desde ese JSON; si no se actualiza, el chat
> seguirá contando el perfil viejo).

---

## 1. Posicionamiento (hero)

**Titular:**

> Consultor Cloud & Oracle | OCI · Oracle APEX · Automatización con Agentes de IA

**Subtítulo (una línea):**

> Opero y analizo infraestructura Oracle Cloud para entornos empresariales y desarrollo
> soluciones en Oracle APEX, usando agentes de IA como multiplicador de productividad.

**Íconos del círculo (reemplazar los actuales):** OCI, Oracle APEX, Oracle Database,
Oracle Linux, n8n, Docker, Git, Claude, Antigravity. Quitar HTML5, Tailwind y el ícono "X"
sin contexto.

---

## 2. Sobre mí (reemplazo propuesto)

Consultor informático en VCE Consulting, enfocado en la operación y el análisis de
infraestructura en **Oracle Cloud Infrastructure (OCI)** para clientes empresariales y en
el desarrollo de aplicaciones con **Oracle APEX**.

Mi diferencial es la forma de trabajar: integro **agentes de IA** (Claude Code,
Antigravity, VS Code con asistentes) en el flujo diario de operación y desarrollo. No los
uso como chat, sino como herramientas de ingeniería: con habilidades (*skills*)
documentadas, servidores MCP conectados a OCI y a bases de datos, memoria persistente y
procedimientos claros, siempre con criterio humano y validación antes de cada acción en
producción.

Estudiante de 10.º semestre de Ingeniería en Sistemas (CUN), Tecnólogo en Análisis y
Desarrollo de Sistemas de Información (SENA) y Técnico en Analítica de Datos (SENA, en
curso).

---

## 3. Orden de secciones

1. Hero
2. Sobre mí
3. **Áreas de trabajo** (nueva: 4 tarjetas, ver sección 4)
4. Experiencia
5. Proyectos
6. Habilidades técnicas
7. Formación y certificaciones
8. Contacto

---

## 4. Áreas de trabajo (sección nueva, 4 tarjetas)

### 4.1 Infraestructura y operación en OCI
- Análisis y operación de infraestructura en múltiples *tenancies* y *compartments* de
  clientes.
- Redes: VCN, subredes, route tables, security lists, NSG, Local Peering Gateways (LPG),
  DRG.
- Load Balancers: listeners, backends, certificados SSL y routing policies.
- Acceso seguro: OCI Bastion (sesiones con varios saltos), SSH por peering e instance
  principals.
- Seguridad y gobierno: Cloud Guard, políticas IAM, dynamic groups, compartments.
- Cómputo y almacenamiento: instancias, shapes flex, block volumes, Object Storage.
- Automatización con OCI CLI y SDK.

### 4.2 Monitoreo y soporte de servidores
- Monitoreo y soporte de servidores Oracle Linux y Windows Server en producción.
- Evaluación periódica de logs: sistema operativo, base de datos Oracle, servidores
  web/aplicación (WebLogic) y Event Viewer.
- Informes técnicos y ejecutivos recurrentes (semanales y mensuales) con hallazgos,
  priorización y planes de acción.
- Soporte de análisis de Oracle Database: sesiones, esperas, espacio y respaldos.

### 4.3 Desarrollo con Oracle APEX asistido por IA
- Desarrollo en **Oracle APEX 26.1** con flujo basado en código: aplicaciones exportadas
  como archivos **`.apx` (APEXlang)**, versionadas en Git y desplegadas/validadas con
  **SQLcl**.
- Agentes de IA que editan, validan (`apex validate`) e importan aplicaciones, con SQLcl
  como fuente de verdad.
- SQL y PL/SQL sobre Oracle Database; ORDS para servicios REST.
- Caso real: Portal de Proveedores (facturación, pagos, certificados de retención).

### 4.4 Automatización e integraciones
- Flujos con **n8n**: facturación electrónica (Dataico/DIAN), recepción de facturas de
  proveedores, integración con ERP y Google Drive.
- Integraciones vía APIs REST/SOAP.
- Despliegue de servicios en contenedores (Docker, Dokploy).

---

## 5. Experiencia (reemplazo del bloque VCE)

**Consultor Informático / Desarrollador — VCE Consulting** · Agosto 2024 – Actualidad

- **Infraestructura OCI multi-cliente:** análisis y operación de entornos Oracle Cloud de
  clientes empresariales: redes (VCN, NSG, LPG, DRG), Load Balancers, Bastion, IAM y
  Cloud Guard.
- **Monitoreo y soporte de servidores:** evaluación periódica de logs (SO, Oracle
  Database, WebLogic, Windows) y elaboración de informes técnicos y ejecutivos con planes
  de acción priorizados.
- **Oracle APEX:** lideré el Portal de Proveedores (autogestión de facturación, pagos y
  certificados de retención). Desarrollo actual en APEX 26.1 con APEXlang (`.apx`) y
  SQLcl, versionado en Git.
- **Automatización financiera:** flujos n8n + Dataico para facturación electrónica: de
  10 minutos a menos de 2 minutos por factura (−80 %).
- **Gestión documental:** recepción automática de facturas de proveedores, almacenamiento
  en Drive y registro de metadatos en el ERP.
- **Ingeniería con agentes de IA:** diseño y uso de *skills*, servidores MCP (OCI, SQLcl,
  documentación Oracle) y memoria persistente para que agentes como Claude Code y
  Antigravity ejecuten análisis de infraestructura, revisión de logs, generación de
  informes y desarrollo APEX de forma trazable y supervisada.
- **Integración B2B retail ↔ JD Edwards (en producción):** integración entre el portal
  B2B de un gran retailer (API REST) y JD Edwards, construida en Oracle APEX/PL/SQL:
  ingreso automático de órdenes de compra al ERP (EDI) y envío de avisos de despacho,
  con mapeos JSON ↔ JDE, ambientes QA/PROD y documentación técnica de entrega.
- **Hubs de facturación electrónica APEX ↔ JDE (en curso):** desarrollo y soporte de
  centros de integración en Oracle APEX que toman documentos de JD Edwards y los
  gestionan ante la DIAN a través de proveedores tecnológicos: emisión, consulta de
  estado, reemisión de rechazados y monitor operativo. Extensión del hub con servicios
  SOAP de un operador logístico (WMS).
- **Conocimiento de referencia en entornos JD Edwards:** conectividad e integración de
  JDE con Oracle Database, APEX e infraestructura OCI (sin administración funcional de
  JDE).

*Tecnologías:* OCI, Oracle Linux, Windows Server, Oracle Database, Oracle APEX 26.1,
SQLcl, ORDS, WebLogic, n8n, Dataico, Docker, Git, Claude Code, Antigravity, MCP.

> **Freelance (Mini-ERP restaurante)** y **Pasantía (Universidad La Gran Colombia)**: se
> mantienen igual.

---

## 6. Proyectos (orden propuesto)

1. **Integración B2B Retail ↔ JD Edwards** (en producción): API REST del
   portal B2B de un gran retailer → Oracle APEX/PL/SQL → JDE (órdenes de compra vía EDI)
   y JDE → retailer (avisos de despacho). Fases en QA y PROD con documentación técnica
   de entrega. Mostrar un diagrama de flujo genérico.
2. **Hubs de Facturación Electrónica APEX ↔ JDE** (en curso): centros de integración en
   APEX 26.1 (APEXlang + SQLcl) para emisión ante la DIAN, monitor de documentos y
   reemisión de rechazados; extensión con servicios SOAP de un WMS logístico.
3. **Portal de Proveedores — Oracle APEX**
4. **Automatización de Facturación Electrónica — n8n + Dataico**
5. **Operación OCI asistida por agentes de IA**: kit de *skills* y conectores MCP para
   analizar tenancies, redes, Cloud Guard y logs, y generar informes. Mostrar la
   arquitectura en un diagrama, **sin datos de clientes**.
6. **Asistente IA del Portafolio** (n8n + agente en contenedor)
7. **Directorio Terrario** (React, Vite, Express, SQLite)
8. **Mini-ERP Restaurante**
9. **Sistema de Invitaciones QR** (PHP, Laravel)

> Quitar el proyecto *Gestión de Vehículos — Arquitectura Hexagonal* del portafolio y
> de `portfolio-facts.json` (incluido el párrafo de "positioning" sobre Java/Spring).

---

## 7. Habilidades técnicas (reagrupadas)

| Área | Tecnologías |
|---|---|
| Cloud (OCI) | Compute, VCN, NSG, LPG, DRG, Load Balancer, Bastion, IAM, Cloud Guard, Object Storage, OCI CLI/SDK |
| Sistemas | Oracle Linux, Windows Server, SSH, monitoreo y análisis de logs, SSL/TLS |
| Oracle | Oracle Database (SQL, PL/SQL), Oracle APEX 26.1, APEXlang (`.apx`), SQLcl, ORDS, WebLogic (soporte) |
| IA aplicada | Claude Code, Antigravity, agentes y subagentes, MCP, *skills*, RAG, NotebookLM, prompt engineering |
| Automatización | n8n, Dataico/DIAN, APIs REST/SOAP, integraciones ERP |
| Integraciones | APIs REST/SOAP, EDI hacia JD Edwards, facturación electrónica DIAN, PL/SQL |
| Desarrollo | PHP/Laravel, JavaScript, React |
| DevOps | Git, Docker, Dokploy, GitHub Actions |
| Referencia | JD Edwards: conectividad e integración, no administración funcional |

---

## 8. Correcciones técnicas y de forma

- [ ] Cambiar el voseo a tuteo neutro: "Pregúntale a mi IA", "Pregunta sobre…",
      "¿Qué quieres saber?" (en `index.html` y en el agente/n8n).
- [ ] Cambiar "RPA" por "Automatización de procesos financieros".
- [ ] Renombrar `logo.cvg` → `logo.svg` y agregar el favicon (hoy da 404).
- [ ] Reemplazar el Tailwind por CDN por un build (Tailwind CLI) para producción.
- [ ] Quitar o atenuar los logos de fondo cortados (ORACLE, Laravel, PHP).
- [ ] Sincronizar `agent/portfolio-facts.json` con este contenido y regenerar `AGENTS.md`.

---

## 9. Reglas de veracidad (para no exagerar)

- **Sin nombres de clientes, IPs, OCIDs ni capturas de consolas reales.** Usar "clientes
  empresariales" y diagramas genéricos.
- Cifras solo verificables. **Por confirmar antes de publicar:**
  - [ ] Cantidad de clientes / tenancies que operas (ej. "10+").
  - [ ] Cantidad aproximada de servidores monitoreados.
  - [ ] Frecuencia exacta de informes por tipo de cliente.
- La IA se presenta como **multiplicador supervisado**, no como reemplazo: tú diriges,
  validas y respondes por el resultado.
- JD Edwards queda **solo como referencia de integración**, nunca como experiencia
  funcional o administrativa.
agente@server-managervce:~$