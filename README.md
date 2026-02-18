# AI-Powered Banking Call Intelligence System
### Enterprise-Grade Hybrid Intelligence for Structured Financial Insights

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Whisper](https://img.shields.io/badge/STT-OpenAI_Whisper-white?style=flat&logo=openai&logoColor=black)](https://github.com/openai/whisper)

## Overview
Financial institutions process thousands of calls daily, yet critical data regarding **intent, urgency, and risk** often remains trapped in raw audio. Manual review is non-scalable, while pure AI approaches introduce hallucination risks—unacceptable in regulated banking environments.

This project implements a **Deterministic + AI-Verified Hybrid Pipeline**. By layering AI verification over rule-based logic, the system ensures **zero hallucination**, full auditability, and a reliable fallback mechanism for compliance-heavy operations.

---

## Key Features
* **Intent Detection:** Hybrid logic to accurately identify customer needs.
* **Risk Mitigation:** Real-time escalation for fraud or high-priority threats.
* **PII Masking:** Automatic redaction of sensitive data for compliance.
* **AI Verification:** Backboard AI layer to review and explain decisions.
* **Smart Fallback:** Automatically reverts to rules if AI confidence is low.

---

## The Hybrid Intelligence Architecture
Unlike standard LLM wrappers, this system uses a tiered decision-making process:

1. **Rule-Based Layer:** Executes keyword-weighted logic for intent and PII masking. This provides a consistent, explainable baseline.
2. **AI Verification Layer:** Reviews the transcript and rule outputs to provide contextual nuance and reasoning.
3. **Fallback Mechanism:** If the AI confidence score is low or the service fails, the system defaults to the deterministic rule-based output.

---

## System Workflow and Data Flow
The system utilizes a synchronous ingestion with an asynchronous polling architecture to ensure stability during intensive transcription tasks.

```mermaid
graph TD
    A[Frontend: Audio Upload] -->|POST /api/calls/analyze| B(Backend: FastAPI Ingestion)
    B --> C{Speech-to-Text}
    C -->|Whisper Model| D[Full Transcript Generation]
    
    subgraph Hybrid_Analysis_Engine
    D --> E[Rule-Based Analysis]
    E -->|Intent/Sentiment/PII| F[AI Verification Layer]
    F -->|Backboard AI| G{Final Decision Merge}
    G -->|Fallback| E
    end
    
    G --> H[(Result Storage)]
    
    I[Frontend: Results Polling] -->|GET /api/calls/result/id| H
    H -->|status: completed| J[Dashboard & Risk Alerts]