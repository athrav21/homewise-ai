import json
import csv

with open('verified_15_papers_final.json', 'r', encoding='utf-8') as f:
    papers = json.load(f)

# 1. Build Markdown File
md_lines = []
md_lines.append("# Literature Review: AI-Based Neighborhood Intelligence for Home-Buying Decision Support")
md_lines.append("**Project Name**: HomeWise AI")
md_lines.append("**Review Version**: Review 2 Academic Survey")
md_lines.append("**Total Papers Analyzed**: 15 Real & Academically Credible Publications\n")

md_lines.append("---")
md_lines.append("## Detailed Survey of 15 Academic Research Papers\n")

for p in papers:
    md_lines.append(f"### Paper {p['no']}: {p['title']}")
    md_lines.append(f"- **Authors**: {p['authors']}")
    md_lines.append(f"- **Year**: {p['year']}")
    md_lines.append(f"- **Journal / Conference**: {p['journal']}")
    md_lines.append(f"- **DOI**: {p['doi']}")
    md_lines.append(f"- **Official URL**: [{p['doi']}]({p['doi']})")
    md_lines.append(f"- **Category**: `{p['category']}`")
    md_lines.append(f"- **Research Problem**: {p['problem']}")
    md_lines.append(f"- **Methodology / Algorithm**: {p['method']}")
    md_lines.append(f"- **Main Findings**: {p['findings']}")
    md_lines.append(f"- **Limitation**: {p['limitation']}")
    md_lines.append(f"- **Relevance to HomeWise AI**: {p['relevance']}\n")
    md_lines.append("---")

# 2. Build Summary Table
md_lines.append("\n## Summary Comparison Table\n")
md_lines.append("| No. | Paper | Year | Method | Main Factor | Relevance to HomeWise AI | Limitation |")
md_lines.append("|---|---|---|---|---|---|---|")

for p in papers:
    # Extract short paper title (First 3 words or Lead Author + Year)
    author_lead = p['authors'].split(',')[0] if p['authors'] else 'Author'
    short_title = f"{author_lead} et al. ({p['year']})"
    main_factor = p['category']
    
    # Clean string pipes for markdown table compatibility
    clean_method = p['method'].replace('|', '/')
    clean_relevance = p['relevance'].replace('|', '/')
    clean_limitation = p['limitation'].replace('|', '/')

    md_lines.append(f"| {p['no']} | **{p['title']}** ({p['authors']}) | {p['year']} | {clean_method} | {main_factor} | {clean_relevance} | {clean_limitation} |")

# 3. Build Literature Synthesis
md_lines.append("\n## Literature Synthesis & Research Gap\n")
synthesis_p1 = (
    "Existing literature in urban economics, GIS spatial analysis, and multi-criteria decision-making (MCDM) "
    "has established that home-buying decisions are fundamentally multi-attribute spatial problems. Prior research "
    "has extensively modeled individual facets of residential location choice: discrete choice models (Schirmer et al., 2014; "
    "Walker & Li, 2007) evaluate household trade-offs; GIS spatial overlay frameworks (Malczewski, 2006; Chandio et al., 2014) "
    "assess land suitability; hedonic pricing studies (Zhang & Dong, 2018) quantify the price impact of neighborhood greenery "
    "and transit access; and algorithmic recommendation systems (Yuan et al., 2020; Wu et al., 2021) leverage user preference "
    "matrices to filter listings. Most existing methodologies employ either static econometric regressions (e.g. Multinomial Logit) "
    "or complex desktop GIS (e.g. ArcGIS Fuzzy AHP) that are optimized for academic researchers or municipal planners rather than "
    "end-user home buyers seeking transparent, interactive decision support."
)

synthesis_p2 = (
    "A major limitation across existing literature is the fragmentation of these analytical domains. Traditional decision "
    "support tools either present raw numerical spatial data without preference-based personalized weighting or output "
    "black-box machine learning scores (Baldominos et al., 2018) that lack natural-language explanations explaining *why* "
    "a specific location was recommended. **HomeWise AI** addresses this research gap by proposing an integrated decision support "
    "framework. Rather than claiming novel mathematical algorithms, HomeWise AI unifies established spatial GIS web mapping "
    "(Leaflet), multi-factor liveability evaluation (schools, hospitals, markets, transit, air quality, flood safety, and crime safety), "
    "dynamic user-preference weighting with budget boundary constraints, and natural-language synthesis ('Prototype AI Insights'). "
    "This synthesis bridges the gap between quantitative spatial MCDM models and accessible, explainable decision support for home buyers."
)

md_lines.append(synthesis_p1 + "\n")
md_lines.append(synthesis_p2 + "\n")

# Write Markdown File
with open('literature_review_15_papers.md', 'w', encoding='utf-8') as f:
    f.write('\n'.join(md_lines))

print("Successfully created literature_review_15_papers.md")

# 4. Build CSV File
csv_columns = [
    "No", "Category", "Paper Title", "Authors", "Year", "Journal / Conference",
    "DOI", "Official URL", "Research Problem", "Methodology", "Main Findings",
    "Limitation", "Relevance to HomeWise AI"
]

with open('literature_review_15_papers.csv', 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    writer.writerow(csv_columns)
    for p in papers:
        writer.writerow([
            p['no'],
            p['category'],
            p['title'],
            p['authors'],
            p['year'],
            p['journal'],
            p['doi'],
            p['url'],
            p['problem'],
            p['method'],
            p['findings'],
            p['limitation'],
            p['relevance']
        ])

print("Successfully created literature_review_15_papers.csv")
