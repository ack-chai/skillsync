export interface DocumentVector {
  id: number | string;
  terms: Record<string, number>;
  magnitude: number;
}

export class VectorEngine {
  private stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by',
    'for', 'from', 'has', 'in', 'is', 'it', 'its',
    'of', 'on', 'that', 'the', 'to', 'was', 'were',
    'will', 'with'
  ]);

  public tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !this.stopWords.has(w));
  }

  public createVector(
    id: number | string,
    text: string,
    boostTerms: Record<string, number> = {}
  ): DocumentVector {

    const tokens = this.tokenize(text);
    const termFreq: Record<string, number> = {};

    for (const t of tokens) {
      termFreq[t] = (termFreq[t] || 0) + 1;
    }

    for (const [k, v] of Object.entries(boostTerms)) {
      const lower = k.toLowerCase();
      termFreq[lower] = (termFreq[lower] || 0) + v;
    }

    let sumSq = 0;

    for (const val of Object.values(termFreq)) {
      sumSq += val * val;
    }

    const magnitude = Math.sqrt(sumSq) || 1.0;

    return { id, terms: termFreq, magnitude };
  }

  public cosineSimilarity(
    vecA: DocumentVector,
    vecB: DocumentVector
  ): number {

    let dotProduct = 0;

    const [smaller, larger] =
      Object.keys(vecA.terms).length < Object.keys(vecB.terms).length
        ? [vecA.terms, vecB.terms]
        : [vecB.terms, vecA.terms];

    for (const [term, val] of Object.entries(smaller)) {
      if (larger[term]) {
        dotProduct += val * larger[term];
      }
    }

    if (vecA.magnitude === 0 || vecB.magnitude === 0) return 0;

    const similarity =
      dotProduct / (vecA.magnitude * vecB.magnitude);

    return Math.round(
      Math.min(1, Math.max(0, similarity)) * 10000
    ) / 100;
  }

  public findComplementaryTeammates(
    projectRequiredSkills: { skill_name: string; required_level: number }[],
    existingTeamSkills: { skill_name: string }[],
    candidateStudents: {
      user_id: number;
      name: string;
      skills: { skill_name: string; proficiency_level: number }[]
    }[]
  ) {

    const coveredSet = new Set(
      existingTeamSkills.map(s => s.skill_name.toLowerCase())
    );

    const missingSkills = projectRequiredSkills.filter(
      req => !coveredSet.has(req.skill_name.toLowerCase())
    );

    return candidateStudents.map(student => {

      let skillsCoveredCount = 0;
      let qualityScore = 0;

      for (const missing of missingSkills) {

        const found = student.skills.find(
          s => s.skill_name.toLowerCase() ===
               missing.skill_name.toLowerCase()
        );

        if (found) {
          skillsCoveredCount++;
          qualityScore +=
            found.proficiency_level / missing.required_level;
        }
      }

      const fitScore = missingSkills.length > 0
        ? Math.round(
            (qualityScore / missingSkills.length) * 10000
          ) / 100
        : 100;

      return {
        user_id: student.user_id,
        name: student.name,
        gap_coverage_count: skillsCoveredCount,
        total_missing_gaps: missingSkills.length,
        complementarity_score: Math.min(100, fitScore)
      };

    }).sort(
      (a, b) => b.complementarity_score - a.complementarity_score
    );
  }
}

export const vectorEngine = new VectorEngine();
