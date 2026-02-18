<<<<<<< vaibhav
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
=======
Financial Audio Intelligence Platform
DevSoc26 Hackathon Submission

Team Name: @HEAVEN_RACER
Hackathon: DevSoc26

Team Members

Vaibhav Goel

Pushp Goel

Gadi Srihari Reddy

Ribhav Aggarwal

Overview

Financial institutions handle a large volume of customer support calls every day. These calls contain valuable information related to customer intent, urgency, emotional state, and potential risk. However, most of this information remains locked in unstructured audio form and is rarely analyzed in real time.

Our project addresses this gap by building a backend system that converts raw customer call audio into structured, actionable insights that bankers can immediately use.

The system is designed with a strong focus on reliability, explainability, and safety, making it suitable for real-world financial environments.

Problem Statement

Existing approaches to call analysis face several challenges:

Audio data is unstructured and difficult to analyze at scale

Manual call review is time-consuming and costly

Pure AI-based systems risk hallucinations and lack transparency

Banking systems require predictable and auditable behavior

There is a need for a solution that combines automation with control, ensuring accuracy without sacrificing reliability.

Solution Approach

We developed a hybrid audio intelligence pipeline that combines deterministic logic with AI-assisted verification.

Instead of replacing decision-making with AI, our system uses AI as a verification layer on top of a rule-based foundation.

System Architecture
1. Audio Ingestion

Customer call recordings are uploaded to the backend through an API endpoint.

2. Speech-to-Text Transcription

We use Whisper for converting audio into text.

Reasons for using Whisper:

High transcription accuracy

Robust performance across accents and speaking styles

Ability to run locally without external API dependency

3. Rule-Based Analysis (Primary Decision Layer)

After transcription, the system applies deterministic logic to extract:

Customer intent (Loan Inquiry, Withdrawal Request, Complaint, etc.)

Customer sentiment (Positive, Neutral, Negative)

Priority level (High, Medium, Low)

Risk indicators

This layer ensures:

Predictable and explainable behavior

Compliance-friendly decisions

Zero hallucination risk

4. AI Verification Layer (Backboard AI)

The AI layer does not generate decisions from scratch.

Instead, it:

Reviews the transcript

Reviews the rule-based intent and priority

Verifies or corrects the system’s decision

Provides reasoning for its conclusion

If the AI layer fails, returns invalid data, or is unavailable, the system automatically falls back to the rule-based output.

This design guarantees system stability and reliability.

5. Banker-Ready Output

The final output includes:

Masked customer details

Rule-based analysis

AI verification result

Final validated decision

Structured summary for bankers

Risk flags when applicable

All results are exposed via clean REST APIs for frontend integration.

Why a Hybrid Approach Instead of Pure GPT?

We intentionally avoided a fully AI-driven decision system.

Reasons:

Financial systems require deterministic behavior

Compliance demands explainability

AI hallucinations are unacceptable in banking

Rule-based logic ensures safety and auditability

Our architecture is model-agnostic.
Backboard AI can be replaced with GPT, Claude, or an internal enterprise model without changing system design.

Technology Stack

Backend Framework: FastAPI

Speech-to-Text: Whisper

AI Verification: Backboard AI

Environment Management: python-dotenv

Architecture: Hybrid (Rule-Based + AI-Assisted)

MVP Capabilities

Audio transcription

Intent detection

Sentiment analysis

Priority and risk assessment

AI-assisted verification

Safe fallback mechanisms

Structured banker summaries

Production-ready APIs

Future Enhancements

Real-time call streaming

CRM and ticketing system integration

Multilingual support

Banker dashboards and analytics

Domain-specific model fine-tuning

Compliance and regulatory tagging

Conclusion

This project demonstrates how AI can be responsibly integrated into financial systems.

By combining deterministic logic with AI verification, we achieve:

Accuracy without hallucination

Automation without loss of control

Intelligence with accountability

The result is a practical, deployable MVP aligned with real-world banking requirements.

Built at DevSoc26 by Team @HEAVEN_RACER


its my readme file 
I want a copy paste thing 
>>>>>>> main
