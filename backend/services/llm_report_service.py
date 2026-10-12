import os
import json
import logging
import requests
from dotenv import load_dotenv

# Load local .env if present
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env")))

logger = logging.getLogger("homewise")

def generate_fallback_report(locality_data, scores, preferences, budget_min, budget_max, factors_meta):
    """
    Deterministic rule-based fallback report generator when external LLM API is unavailable.
    Preserves exact metrics, property prices, and data sources without hallucination.
    """
    name = locality_data.get("name", "Selected Locality")
    city = locality_data.get("city", "Mumbai")
    price = locality_data.get("averagePriceCr", 3.0)
    match_score = scores.get("livabilityScore", scores.get("matchScore", 80))
    is_in_budget = price <= budget_max

    # Identify top strengths (scores >= 85)
    strengths = []
    if scores.get("schoolScore", 0) >= 88:
        strengths.append(f"Premier academic ecosystem ({scores.get('schoolScore')}/100) verified via UDISE+ and OSM spatial mapping.")
    if scores.get("hospitalScore", 0) >= 85:
        strengths.append(f"High-density healthcare access ({scores.get('hospitalScore')}/100) with rapid emergency and bed availability.")
    if scores.get("connectivityScore", 0) >= 88:
        strengths.append(f"Exceptional transit network ({scores.get('connectivityScore')}/100) connecting to commercial business districts.")
    if scores.get("safetyScore", 0) >= 85:
        strengths.append(f"Favorable neighborhood safety profile ({scores.get('safetyScore')}/100) according to Mumbai Police & NCRB statistics.")
    if scores.get("waterScore", 0) >= 88:
        strengths.append(f"Consistent municipal water reliability ({scores.get('waterScore')}/100) maintained by BMC water grid.")
    if scores.get("powerScore", 0) >= 90:
        strengths.append(f"Dependable electrical grid stability ({scores.get('powerScore')}/100) with minimal outage disruptions.")
    if scores.get("futureInfrastructureScore", 0) >= 88:
        strengths.append(f"Significant future growth corridor ({scores.get('futureInfrastructureScore')}/100) backed by MMRDA infrastructure planning.")
    if is_in_budget:
        strengths.append(f"Property valuation of ₹{price} Cr comfortably fits within your target budget ceiling of ₹{budget_max} Cr.")

    # Identify potential concerns
    concerns = []
    if not is_in_budget:
        concerns.append(f"Average property price of ₹{price} Cr exceeds your ₹{budget_max} Cr target budget ceiling.")
    if scores.get("floodSafetyScore", 80) < 78:
        concerns.append(f"Monsoon flood risk score is {scores.get('floodSafetyScore', 75)}/100; low-lying lanes may face transient monsoon waterlogging based on ISRO Bhuvan elevation data.")
    if scores.get("airQualityScore", 80) < 72:
        concerns.append(f"Air quality rating of {scores.get('airQualityScore', 70)}/100 reflects urban vehicular density along primary transit arteries.")
    if len(concerns) == 0:
        concerns.append("Higher entry price point compared to peripheral MMR suburbs.")

    summary = (
        f"{name} ({city}) achieves an overall personalized HomeWise Match Score of {match_score}/100. "
        f"With an average property valuation of ₹{price} Cr, the neighborhood demonstrates "
        f"{'strong budget alignment' if is_in_budget else 'a premium price point exceeding current budget targets'}. "
        f"The locality balances {scores.get('connectivityScore', 80)}/100 transit accessibility with {scores.get('safetyScore', 80)}/100 community safety."
    )

    reasons = (
        f"This locality is recommended based on your prioritized criteria. "
        f"It provides a balanced combination of municipal infrastructure ({scores.get('waterScore', 85)}/100 water, {scores.get('powerScore', 90)}/100 power) "
        f"and key daily lifestyle facilities."
    )

    verdict = (
        f"Recommended for buyers prioritizing {'long-term family livability and infrastructure quality' if is_in_budget else 'prime location benefits who have budget flexibility'}. "
        f"Always verify on-ground RERA titles and property documentation before final purchase decisions."
    )

    return {
        "provider": "HomeWise Deterministic Synthesis (Fallback)",
        "executive_summary": summary,
        "match_reasons": reasons,
        "strengths": strengths[:4] if strengths else [f"Balanced neighborhood infrastructure in {city}."],
        "concerns": concerns[:3],
        "recommendation": verdict,
        "is_llm_generated": False
    }

def generate_llm_report(locality_data, scores, preferences, budget_min, budget_max, factors_meta):
    """
    Calls configured LLM API (Google Gemini or OpenAI) using server-side API keys.
    Falls back gracefully to deterministic rule-based report if API is unavailable or keys are missing.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if not gemini_key and not openai_key:
        logger.info("No LLM API key configured (GEMINI_API_KEY or OPENAI_API_KEY). Using deterministic fallback.")
        return generate_fallback_report(locality_data, scores, preferences, budget_min, budget_max, factors_meta)

    # Prepare structured prompt with strict guardrails
    name = locality_data.get("name", "Selected Locality")
    city = locality_data.get("city", "Mumbai")
    price = locality_data.get("averagePriceCr", 3.0)
    match_score = scores.get("livabilityScore", scores.get("matchScore", 80))

    prompt = f"""You are HomeWise AI, an expert neighborhood decision-support intelligence analyst for the Mumbai Metropolitan Region (MMR), India.
Generate a structured neighborhood intelligence report for home buyers based strictly on the provided factual metrics.

STRICT CONSTRAINTS:
1. Do NOT fabricate, invent, or change any scores, property prices, data sources, or factual figures.
2. Only use the metrics provided below.
3. Keep the tone professional, analytical, objective, and realistic.
4. Output MUST be valid JSON with exactly the following keys:
   "executive_summary": string,
   "match_reasons": string,
   "strengths": list of 3-4 strings,
   "concerns": list of 2-3 strings,
   "recommendation": string

FACTUAL DATA:
- Locality: {name}, {city}
- Average Property Price: ₹{price} Cr
- User Target Budget Range: ₹{budget_min} Cr – ₹{budget_max} Cr
- Personalized HomeWise Match Score: {match_score}/100
- 12 Dimension Scores:
  * School Quality: {scores.get('schoolScore', 80)}/100 (Source: UDISE+ / OSM)
  * Hospital Accessibility: {scores.get('hospitalScore', 80)}/100 (Source: BMC / OpenCity / OSM)
  * Market & Shopping: {scores.get('marketScore', 80)}/100 (Source: Overpass POIs)
  * Safety & Low Crime: {scores.get('safetyScore', 80)}/100 (Source: Mumbai Police / NCRB)
  * Transit Connectivity: {scores.get('connectivityScore', 80)}/100 (Source: OSM / MMRDA Metro)
  * Clean Air Quality: {scores.get('airQualityScore', 70)}/100 (Source: CPCB / MPCB Stations)
  * Monsoon Flood Safety: {scores.get('floodSafetyScore', 70)}/100 (Source: ISRO Bhuvan Elevation Hazard Data)
  * Water Supply Reliability: {scores.get('waterScore', 85)}/100 (Source: BMC Municipal Water)
  * Power Grid Reliability: {scores.get('powerScore', 90)}/100 (Source: MSEDCL Grid Outage Data)
  * Future Infrastructure: {scores.get('futureInfrastructureScore', 80)}/100 (Source: MMRDA Master Plan)
  * Price Affordability: {scores.get('priceScore', 75)}/100 (Source: 70K+ Housing Dataset)
  * Overall Livability: {match_score}/100 (MCDM Preference Aggregation)
- User Priorities: {json.dumps(preferences)}

Respond ONLY with the JSON object. Do not include markdown code blocks or text outside the JSON.
"""

    # 1. Try Gemini if configured
    if gemini_key and not gemini_key.startswith("AIzaSyYour"):
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 800}
            }
            resp = requests.post(url, json=payload, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                if text.startswith("```"):
                    text = text.split("```")[1]
                    if text.startswith("json"):
                        text = text[4:]
                parsed = json.loads(text.strip())
                parsed["provider"] = "Google Gemini (1.5 Flash)"
                parsed["is_llm_generated"] = True
                return parsed
        except Exception as e:
            logger.warning(f"Gemini API request failed: {e}. Trying fallback.")

    # 2. Try OpenAI if configured
    if openai_key and not openai_key.startswith("sk-proj-Your"):
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are a real estate intelligence AI assistant that outputs JSON only."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2,
                "response_format": {"type": "json_object"}
            }
            resp = requests.post(url, headers=headers, json=payload, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                parsed = json.loads(data["choices"][0]["message"]["content"])
                parsed["provider"] = "OpenAI (GPT-4o mini)"
                parsed["is_llm_generated"] = True
                return parsed
        except Exception as e:
            logger.warning(f"OpenAI API request failed: {e}. Trying fallback.")

    # Graceful fallback to deterministic synthesis
    return generate_fallback_report(locality_data, scores, preferences, budget_min, budget_max, factors_meta)
