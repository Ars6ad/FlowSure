# GigShield Platform

GigShield is a comprehensive, full-stack parametric insurance application designed to provide automated financial protection for gig economy workers against location-based disruptions, including adverse weather conditions and recent regional seismic activities.

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Core Features](#core-features)
3. [Technology Stack](#technology-stack)
4. [External Integrations](#external-integrations)
5. [Setup Instructions](#setup-instructions)
6. [Mathematical Risk Modeling](#mathematical-risk-modeling)
7. [Database Schema Structure](#database-schema-structure)

---

## System Architecture

The overall architecture separates user flows into two highly distinct environments protected by role-based routing and a fully integrated Firebase Backend. 

- **Worker Module**: Focuses heavily on precise GPS tracking, dynamic risk-profile underwriting based on geographical location, and automated policy administration.
- **Admin Module**: Provides regional overview functionality, administrative authorization over manual claims, and simulation frameworks for triggering cross-platform system disruption audits.

---

## Core Features

### Role-Based Access Systems
* **Multi-Step Worker Registration**: Captures complex worker states including GPS coordinates, platform affiliations, biometric placeholders, operational demographics, and banking requirements.
* **Regional Administrative Access**: Confines admin environments strictly to geographical sectors, enforcing data segregation.

### Automated Claims Engine
* **No-File Architecture**: Claims are evaluated instantly in the background without user submission.
* **Trigger Validations**: Utilizes external APIs to cross-reference a worker's registered location against current meteorological anomalies and seismic databases.

### Machine Learning Fraud Detection
* **Pure JavaScript Neural Network Simulation**: Evaluates manual claim submissions using a hand-tuned weighted scoring model (sigmoid activation).
* Assesses four dynamic parameters independently: Real-time API Weather Severity, Real-time API Earthquake Magnitude, Regional Claim Density (within 24 hours), and User Historical Fraud Scores.
* Completely browser-compatible implementation with zero external dependencies (Node library `brain.js` replaced for native web execution).

### Dynamic Underwriting (Risk Model)
* Implements a JavaScript heuristics engine assessing the provided physical address against historical geospatial metadata (Flood plains, cyclonic incidence, high-density traffic congestion lines, and static Indian Seismic Zones).
* Dynamically calculates a 0-100 normalized risk score, modulating policy premiums and maximum capital payouts dynamically.

---

## Technology Stack

| Domain | Technology / Framework | Function |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | Core user interface and component architecture |
| **Routing** | React Router DOM | Protected route navigation and module compartmentalization |
| **Styling** | Tailwind CSS / Vanilla CSS | Responsive layouts and design system implementation |
| **Authentication** | Firebase Auth | Secure credential management and session persistence |
| **Database** | Firebase Firestore | NoSQL document storage for users, policies, and claims |

---

## External Integrations

GigShield interfaces with several third-party platforms to execute its core autonomous underwriting and validation mechanisms.

| Service Name | Description | Protocol | Cost Parameters |
| :--- | :--- | :--- | :--- |
| **OpenWeatherMap** | Provides live telemetry concerning local rainfall rates in millimeters per hour to validate urban flooding triggers. | REST API | Authenticated Key Required |
| **USGS Earthquake Data** | Retrieves 48-hour trailing seismic magnitudes matching the worker's coordinate radius (max 300km). | REST API | Free / Public Access |
| **OSM Nominatim** | Conducts reverse geocoding to accurately translate raw browser geolocation hardware coordinates into normalized District/State addresses. | REST API | Free / Public Access |

---

## Setup Instructions

### Prerequisites
* Node.js (v18.0.0 or higher recommended)
* A registered Firebase Web Project
* An OpenWeatherMap API Key

### Local Initialization

1. **Clone the Repository**
Navigate to your desired root directory and clone the build.

2. **Install Dependencies**
Navigate to the `/app` subdirectory and execute the Node package manager.
```bash
cd app
npm install
```

3. **Configure Environment Variables**
Duplicate the provided example environment template and populate it with your specific service keys.
```bash
cp .env.example .env
```
Ensure the `.env` file contains the following structure:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_OPENWEATHER_API_KEY=your_openweathermap_key
```

4. **Boot the Environment**
Start the Vite development compiler.
```bash
npm run dev
```
The localized server will host the application at `http://localhost:3000/`.

---

## Mathematical Risk Modeling

The internal `riskModel.js` engine correlates user locations against national historical tables.

**Underwriting Calculation Matrix:**
1. **Base Seismic Offset**: Points injected evaluating the Indian Standard Grid (Zone II to Zone V).
2. **Flood Risk Amplification**: Cross-referenced state data injects up to 35 variable points if the territory falls within primary alluvial flood plains.
3. **Coastal Cyclone Proximity**: Additional weight applied for coastal districts with documented depression formations.
4. **Urban Density Metric**: Validates standard city topologies to factor in infrastructure degradation metrics and delivery risk modifiers.

*Final normalized values aggregate into Low (<35), Medium (35-64), or High (>65) classification vectors affecting premium minimums.*

---

## Database Schema Structure

The platform organizes unstructured data into four primary Firestore collections.

| Collection | Description | Primary Key Usage |
| :--- | :--- | :--- |
| `workers` | Central directory for gig employee PII, platform metadata, banking, and physical origins. | `uid` (Auth Token Link) |
| `admins` | Authorization directory governing operational region assignments. | `uid` (Auth Token Link) |
| `policies` | Encapsulates the active financial protection contracts. Includes capital thresholds and trigger specifics. | Auto-generated UUID |
| `claims` | The historical payout queue representing meteorological alerts, admin modifications, or worker requests. | Auto-generated UUID |

---
*GigShield — Resilient Infrastructure for the Decentralized Workforce.*
