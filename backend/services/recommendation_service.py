from .scoring_service import calculate_personalized_match

def rank_localities_for_user(localities, preferences, budget_max):
    """
    Ranks all localities dynamically using the user's specific 1-10 preference weights and budget.
    Returns a sorted list of scored locality objects.
    """
    results = []

    for loc in localities:
        # Extract 11 factor scores
        scores = {
            "schoolScore": loc.get("schoolScore", 80),
            "hospitalScore": loc.get("hospitalScore", 80),
            "marketScore": loc.get("marketScore", 80),
            "safetyScore": loc.get("safetyScore", loc.get("crimeRiskScore", 80)),
            "connectivityScore": loc.get("connectivityScore", 80),
            "airQualityScore": loc.get("airQualityScore", 70),
            "floodSafetyScore": loc.get("floodSafetyScore", 70),
            "waterScore": loc.get("waterScore", 85),
            "powerScore": loc.get("powerScore", 90),
            "futureInfrastructureScore": loc.get("futureInfrastructureScore", loc.get("futureDevelopmentScore", 80)),
            "priceScore": loc.get("priceScore", 75)
        }

        price_cr = loc.get("averagePriceCr", 3.5)

        # Compute dynamic match score
        match_score, price_score, weights = calculate_personalized_match(scores, preferences, budget_max, price_cr)

        # Synthesize Why Text
        top_reasons = []
        if scores["schoolScore"] >= 88 and float(preferences.get("school", 5)) >= 7:
            top_reasons.append("high school accessibility")
        if scores["hospitalScore"] >= 88 and float(preferences.get("hospital", 5)) >= 7:
            top_reasons.append("top healthcare density")
        if scores["connectivityScore"] >= 90 and float(preferences.get("connectivity", 5)) >= 7:
            top_reasons.append("transit connectivity")
        if scores["safetyScore"] >= 88 and float(preferences.get("safety", 5)) >= 7:
            top_reasons.append("superior safety rating")
        if scores["airQualityScore"] >= 75 and float(preferences.get("airQuality", 5)) >= 7:
            top_reasons.append("cleaner air quality")
        if scores["waterScore"] >= 88 and float(preferences.get("water", 5)) >= 7:
            top_reasons.append("reliable BMC water supply")
        if scores["futureInfrastructureScore"] >= 88 and float(preferences.get("futureInfrastructure", 5)) >= 7:
            top_reasons.append("strong future infra growth")
        if price_cr <= budget_max:
            top_reasons.append(f"fits your ₹{budget_max} Cr budget")

        if len(top_reasons) >= 2:
            why_text = f"Strong match because of its {', '.join(top_reasons[:3])}."
        else:
            why_text = f"Balanced MMR location offering ₹{price_cr} Cr pricing, {scores['connectivityScore']}/100 transit access, and {match_score}/100 match score."

        results.append({
            "locality": loc,
            "matchScore": match_score,
            "priceScore": price_score,
            "scores": scores,
            "whyText": why_text,
            "isWithinBudget": price_cr <= budget_max
        })

    # Sort descending by matchScore
    results.sort(key=lambda x: (x["isWithinBudget"], x["matchScore"]), reverse=True)

    return results
