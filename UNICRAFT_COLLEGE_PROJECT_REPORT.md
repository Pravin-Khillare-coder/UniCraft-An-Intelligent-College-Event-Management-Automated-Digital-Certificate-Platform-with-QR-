# ACADEMIC PROJECT REPORT

---

## **PROJECT TITLE**
# **UniCraft: An Intelligent College Event Management & Automated Digital Certificate Platform with QR Verification**

**Course / Degree:** Bachelor of Technology (B.Tech) / Bachelor of Computer Applications (BCA) / M.Tech  
**Department:** Department of Computer Science & Engineering / Information Technology  
**Academic Session:** 2025–2026  

---

## **TABLE OF CONTENTS**
1. [Abstract](#1-abstract)
2. [Introduction & Problem Statement](#2-introduction--problem-statement)
3. [Objectives & Project Scope](#3-objectives--project-scope)
4. [System Requirements & Architecture](#4-system-requirements--architecture)
5. [Technology Stack](#5-technology-stack)
6. [Core System Modules](#6-core-system-modules)
7. [Database Schema & Data Models](#7-database-schema--data-models)
8. [Algorithm & Implementation Highlights](#8-algorithm--implementation-highlights)
9. [Verification & Testing](#9-verification--testing)
10. [Conclusion & Future Scope](#10-conclusion--future-scope)

---

## **1. ABSTRACT**

In modern academic institutions, managing campus events, tracking student attendance, issuing physical certificates, and verifying credential authenticity manually is labor-intensive, error-prone, and vulnerable to document forgery. 

**UniCraft** is a full-stack web application designed to automate the complete lifecycle of college events and academic certifications. UniCraft provides an interactive **Drag-and-Drop Visual Certificate Designer**, enabling administrators to design custom certificate layouts with dynamic labels, custom background templates, college logos, official stamps/seals, and multi-signatory blocks (Principal, HOD, Coordinators). 

Upon event completion and attendance verification, UniCraft automatically allocates unique sequential serial numbers (`CERT-YYYY-XXXX`) and generates high-resolution vector PDF certificates embedded with **Tamper-Proof Verification QR Codes**. Scanning the QR code from any smartphone instantly resolves the credential on the network verification portal, providing immediate authenticity checks and direct PDF downloads.

---

## **2. INTRODUCTION & PROBLEM STATEMENT**

### **2.1 Background**
Colleges organize numerous symposiums, hackathons, workshops, and cultural fests throughout the academic year. Certificates issued to participants serve as verified credentials for resumes and higher education applications.

### **2.2 Existing System Limitations**
* **Manual Design & Printing Costs:** Certificate generation relies on static graphics templates requiring individual manual name editing in desktop tools.
* **Lack of Verification:** Traditional paper or image certificates lack a digital audit mechanism, making them vulnerable to image tampering and credential fraud.
* **Loss of Records:** Physical registers or fragmented spreadsheet logs lead to loss of certificate allotment records over time.
* **Inconvenient Retrieval:** Students who lose physical certificates face complex manual reissue processes.

### **2.3 Proposed UniCraft Solution**
UniCraft bridges these gaps by offering:
1. End-to-end event registration and student participation tracking.
2. A real-time visual canvas editor for designing pixel-accurate certificate templates.
3. Automated bulk PDF certificate generation with dynamic sequence numbers.
4. Smart LAN IP-resolved QR verification that opens a clean mobile verification portal.
5. Centralized credential registry with real-time CSV audit report export.

---

## **3. OBJECTIVES & PROJECT SCOPE**

* **User Role Authentication:** Role-Based Access Control (RBAC) separating Admin controls from Student portals.
* **Interactive Event Management:** Create, update, publish, and manage college events with registration limits, venue tracking, and attendance marking.
* **Visual Canvas Certificate Designer:** Real-time WYSIWYG editor featuring draggable text, adjustable font sizes, color pickers, custom background uploads, college logos, stamps, and multi-row signature cards.
* **Sequential Serial Number Allotment:** Automatic sequence allocation logic preventing duplicate certificate serial numbers across events.
* **Instant Mobile QR Verification:** Dynamic network IP resolution generating scannable QR codes that work over Wi-Fi networks on mobile devices.
* **Audit Registry & Export:** Complete administrative control to search, edit, revoke, or export certificate allotment logs in CSV format.

---

## **4. SYSTEM REQUIREMENTS & ARCHITECTURE**

### **4.1 System Architecture**
UniCraft follows a modern **Client-Server Architecture**:
```
 +------------------------+              +------------------------+
 |   Student / Admin      |              |   Backend REST API     |
 |   React Frontend (Vite)| <== HTTP ==> |   Node.js / Express    |
 |   Port: 5173           |              |   Port: 5000           |
 +------------------------+              +------------------------+
             |                                       |
             v                                       v
 +------------------------+              +------------------------+
 | QR Scanner (Mobile)    |              | Certificate Engine     |
 | Verification Portal    |              | (PDFKit & QR Generator)|
 +------------------------+              +------------------------+
```

### **4.2 Software Requirements**
* **Operating System:** Windows 10/11 / Linux / macOS
* **Runtime Environment:** Node.js v18.x or higher
* **Frontend Framework:** React 18 with Vite
* **Styling Framework:** TailwindCSS & Lucide Icons
* **PDF Generation Engine:** PDFKit
* **QR Generation Library:** qrcode

---

## **5. TECHNOLOGY STACK**

| Layer | Technology Used | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | SPA User Interface & State Management |
| **Styling & Icons** | TailwindCSS, Lucide React | Modern Responsive Dark/Light UI Design |
| **Backend API** | Node.js, Express.js | REST API Endpoints & Auth Middleware |
| **PDF Generation** | PDFKit | High-resolution Vector Certificate PDF Rendering |
| **QR Code Engine** | qrcode | Dynamic QR Code Matrix Encoding |
| **Database** | MongoDB / Local DB | Persistent Storage for Users, Events, and Certificates |

---

## **6. CORE SYSTEM MODULES**

### **Module 1: Authentication & Role Management**
* Multi-role authentication (Admin & Student).
* JWT token authentication with secure persistent state.

### **Module 2: Event Lifecycle & Attendance Management**
* Admin event creation, venue allocation, and date scheduling.
* Student one-click event registration.
* Attendance marking system (`Present` status required for certificate issuance).

### **Module 3: Drag-and-Drop Certificate Designer**
* Live 640x452 px visual canvas representing 842x595 pt landscape A4 PDF dimensions.
* Dynamic element positioning (X/Y coordinates), font scaling, color pickers, and underline toggles.
* Multi-signature card layout supporting Principal, HOD, and Event Coordinators.
* Custom seal/stamp image element and custom template background upload.

### **Module 4: Automated Bulk Certificate Issuance**
* One-click bulk certificate generation for all present event attendees.
* Automatic incrementing of next sequence serial number (e.g. `CERT-2026-0001` -> `CERT-2026-0002`).

### **Module 5: Mobile-Friendly QR Verification Portal**
* Scanning embedded QR code resolves dynamic LAN network IP (`http://<LAN_IP>:5173/verify-certificate/<CODE>`).
* Minimalist, high-contrast mobile verification UI featuring verified credential status badge and one-click PDF download button.

### **Module 6: Credentials Registry & Audit Reporting**
* Administrative search and filter table across student names, roll numbers, serial numbers, and event titles.
* Instant CSV report generator exporting complete allotment logs for institutional compliance.

---

## **7. DATABASE SCHEMA & DATA MODELS**

### **7.1 User Model (`User`)**
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "role": "admin | student",
  "profile": {
    "rollNumber": "String",
    "department": "String",
    "avatar": "String"
  }
}
```

### **7.2 Event Model (`Event`)**
```json
{
  "_id": "ObjectId",
  "title": "String",
  "date": "Date",
  "venue": "String",
  "organizer": "String",
  "nextCertificateNumber": "String",
  "certificateTemplate": "Base64 String",
  "certificateLayout": "Object",
  "signatures": [
    { "name": "String", "title": "String", "signatureImage": "Base64" }
  ]
}
```

### **7.3 Certificate Model (`Certificate`)**
```json
{
  "_id": "ObjectId",
  "certificateId": "String (Serial Number)",
  "studentId": "ObjectId (Ref: User)",
  "eventId": "ObjectId (Ref: Event)",
  "verificationCode": "String (Unique Hash)",
  "issuedAt": "ISO Date String"
}
```

---

## **8. ALGORITHM & IMPLEMENTATION HIGHLIGHTS**

### **8.1 Canvas-to-PDF Coordinate Scaling Algorithm**
To ensure exact visual fidelity between the 640x452 px browser canvas and the 842x595 pt PDF document:
$$\text{Scale}_X = \frac{640}{842} \approx 0.760, \quad \text{Scale}_Y = \frac{452}{595} \approx 0.759$$
$$\text{PDF}_X = \frac{\text{Canvas}_X}{\text{Scale}_X}, \quad \text{PDF}_Y = \frac{\text{Canvas}_Y}{\text{Scale}_Y}$$

### **8.2 Dynamic Local Area Network (LAN) IP Resolution**
To enable seamless QR code scanning on mobile devices over Wi-Fi without hardcoding `localhost`:
```javascript
function resolveFrontendHostUrl(req) {
  if (process.env.CLIENT_URL) return process.env.CLIENT_URL.replace(/\/$/, '');
  
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    for (const alias of interfaces[devName]) {
      if (alias.family === 'IPv4' && !alias.internal && alias.address !== '127.0.0.1') {
        return `http://${alias.address}:5173`;
      }
    }
  }
  return 'http://localhost:5173';
}
```

### **8.3 Sequential Certificate Numbering Algorithm**
```javascript
function incrementCertificateNumber(currentNum) {
  const match = currentNum.match(/^(.*?)(\d+)$/);
  if (!match) return currentNum + '-1';
  const prefix = match[1];
  const numStr = match[2];
  const nextNum = parseInt(numStr, 10) + 1;
  return prefix + String(nextNum).padStart(numStr.length, '0');
}
```

---

## **9. VERIFICATION & TESTING**

### **9.1 Test Cases & Results**

| Test Case | Description | Expected Outcome | Result |
| :--- | :--- | :--- | :--- |
| **TC-01** | Student Event Registration | Student registers; capacity updates | **PASS** |
| **TC-02** | Certificate Visual Designer Drag & Drop | Elements re-position on visual canvas | **PASS** |
| **TC-03** | Auto-Sequence Serial Allotment | `CERT-2026-0001` increments to `CERT-2026-0002` | **PASS** |
| **TC-04** | QR Code Scan on Mobile Device | Scans over Wi-Fi, loads verification page | **PASS** |
| **TC-05** | One-Click Direct PDF Download | PDF downloads with embedded signature/stamp | **PASS** |
| **TC-06** | CSV Allotment Report Export | Exports `.csv` spreadsheet of serial numbers | **PASS** |

---

## **10. CONCLUSION & FUTURE SCOPE**

### **10.1 Conclusion**
**UniCraft** successfully modernizes college event management and certificate processing. By combining an intuitive drag-and-drop visual certificate designer with automated sequential serial allotment, vector PDF rendering, and instant mobile QR code verification, UniCraft eliminates physical paperwork, prevents credential fraud, and delivers a premium user experience for both students and administrators.

### **10.2 Future Scope**
* **Blockchain Credential Anchoring:** Storing certificate hash signatures on a public/private blockchain (Ethereum / Polygon) for immutable verification.
* **Automated Email & WhatsApp Delivery:** Sending generated PDF certificates directly to registered student emails upon event completion.
* **LinkedIn Credential Integration:** Adding direct "Add to LinkedIn Profile" buttons on the verification portal.

---
*Report Generated for UniCraft Academic Submission.*
