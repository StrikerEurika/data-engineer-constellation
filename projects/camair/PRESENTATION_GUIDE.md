Project Description: CamAir - Cambodia Environmental Monitoring System

  This document serves as the official project description for the CamAir data engineering project, designed for
  a final project presentation.

  ---

  1. Project Overview
  CamAir is a robust, end-to-end data engineering platform designed to monitor environmental conditions across   
  Cambodia in real-time. The system ingests, processes, and visualizes Air Quality Index (AQI), Weather, and UV  
  Index data for all 25 provinces, providing citizens and stakeholders with live, actionable insights into their 
  environment.

  2. Problem Statement & Motivation
  Cambodia's rapid urbanization and climate vulnerability necessitate accessible, real-time environmental data.  
  Previously, this data was scattered or difficult to consume programmatically. CamAir addresses this by:        
   * Centralizing Data: Consolidating diverse environmental metrics from public APIs into a single source of     
     truth.
   * Real-Time Processing: Moving beyond static snapshots to a streaming architecture that reflects current      
     conditions.
   * Geospatial Context: Leveraging spatial databases to provide province-specific insights and proximity-based  
     queries.

  3. Technical Architecture
  The project employs a modern "Medallion-inspired" architecture, utilizing a high-performance tech stack:

   * Ingestion Layer: Apache Airflow orchestrates a Python-based ingestor that polls MEF Cambodia APIs every 15
     minutes, pushing raw JSON payloads into Apache Kafka.
   * Processing Layer: Apache Spark Structured Streaming (PySpark) consumes Kafka topics. It performs data
     cleaning, schema validation, and enrichment (e.g., calculating AQI levels and attaching timestamps).
   * Storage Layer: A PostgreSQL database enhanced with PostGIS stores the processed data and high-resolution
     province boundaries (GeoJSON).
   * Serving Layer: A FastAPI backend provides RESTful endpoints and uses WebSockets for pushing live updates to
     clients without page refreshes.
   * Visualization Layer: A React (TypeScript) dashboard featuring interactive maps (Leaflet) and trend charts
     (Recharts).

  4. The Data Engineering Pipeline (The Heart)
  The core of CamAir is its triple-stream pipeline:
   1. Extraction: Continuous polling of REST APIs.
   2. Buffering: Kafka acts as a message broker, ensuring system resilience and decoupling ingestion from        
      processing.
   3. Transformation: Spark streaming jobs handle the "heavy lifting":
       * Parsing nested JSON.
       * Standardizing units and data types.
       * Deduplication and windowing for time-series consistency.
   4. Loading: Sinking data into both relational tables (PostgreSQL) for operational use and Parquet files for   
      long-term analytical storage.

  5. Geospatial & Real-Time Innovation
   * Spatial Intelligence: By using PostGIS, CamAir allows users to query data based on location, such as "Find
     the AQI of provinces within 50km of Phnom Penh."
   * Live Synchronization: The integration of a database poller and WebSockets ensures that as soon as Spark
     commits a new record to the database, the frontend dashboard updates globally across all connected users
     within seconds.

  6. Tech Stack Summary
  ┌───────────────────┬─────────────────────────────────┐
  │ Component         │ Technology                      │
  ├───────────────────┼─────────────────────────────────┤
  │ Orchestration     │ Apache Airflow                  │
  │ Streaming/Buffer  │ Apache Kafka                    │
  │ Stream Processing │ Apache Spark (PySpark)          │
  │ Database          │ PostgreSQL + PostGIS            │
  │ Backend API       │ FastAPI (Python)                │
  │ Frontend UI       │ React, TypeScript, Tailwind CSS │
  │ Infrastructure    │ Docker Compose                  │
  └───────────────────┴─────────────────────────────────┘

  7. Future Roadmap
   * Predictive Analytics: Implementing ML models on the historical Parquet data to forecast AQI trends.
   * Public Alerting: Integrating a notification service (Telegram/Email) for health alerts when AQI exceeds     
     "Unhealthy" thresholds.
   * Expanded Data Sources: Integrating satellite imagery and additional IoT sensor networks.