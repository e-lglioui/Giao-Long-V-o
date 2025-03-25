import { Injectable } from '@nestjs/common';
import { Progress, GradeLevel } from '../schemas/progress.schema';

@Injectable()
export class ProgressEvaluationService {
  evaluateReadinessForNextGrade(progress: Progress): boolean {
    const minimumRequirements = this.getMinimumRequirements(progress.currentGrade);
    const currentSkills = this.aggregateSkills(progress);
    
    return this.meetsRequirements(currentSkills, minimumRequirements);
  }

  private getMinimumRequirements(grade: GradeLevel): Map<string, number> {
    const requirements = new Map<string, number>();
    
    switch (grade) {
      case GradeLevel.WHITE:
        requirements.set('basics', 3);
        requirements.set('discipline', 2);
        break;
      case GradeLevel.YELLOW:
        requirements.set('basics', 4);
        requirements.set('discipline', 3);
        requirements.set('techniques', 2);
        break;
      // Ajouter d'autres niveaux avec leurs exigences
    }

    return requirements;
  }

  private aggregateSkills(progress: Progress): Map<string, number> {
    const skills = new Map<string, number>();

    progress.skills.forEach(skill => {
      if (skills.has(skill.skill)) {
        // Prendre la note la plus récente pour chaque compétence
        const currentSkill = skills.get(skill.skill);
        if (skill.evaluatedAt > progress.skills.find(s => 
          s.skill === skill.skill && s.level === currentSkill
        ).evaluatedAt) {
          skills.set(skill.skill, skill.level);
        }
      } else {
        skills.set(skill.skill, skill.level);
      }
    });

    return skills;
  }

  private meetsRequirements(
    currentSkills: Map<string, number>,
    requirements: Map<string, number>
  ): boolean {
    for (const [skill, requiredLevel] of requirements) {
      const currentLevel = currentSkills.get(skill) || 0;
      if (currentLevel < requiredLevel) {
        return false;
      }
    }
    return true;
  }

  calculateOverallProgress(progress: Progress): number {
    const requirements = this.getMinimumRequirements(progress.currentGrade);
    const currentSkills = this.aggregateSkills(progress);
    let totalProgress = 0;
    let totalRequirements = 0;

    for (const [skill, requiredLevel] of requirements) {
      const currentLevel = currentSkills.get(skill) || 0;
      totalProgress += (currentLevel / requiredLevel) * 100;
      totalRequirements++;
    }

    return totalProgress / totalRequirements;
  }

  suggestImprovementAreas(progress: Progress): string[] {
    const requirements = this.getMinimumRequirements(progress.currentGrade);
    const currentSkills = this.aggregateSkills(progress);
    const improvements: string[] = [];

    for (const [skill, requiredLevel] of requirements) {
      const currentLevel = currentSkills.get(skill) || 0;
      if (currentLevel < requiredLevel) {
        improvements.push(
          `Need to improve ${skill} from level ${currentLevel} to ${requiredLevel}`
        );
      }
    }

    return improvements;
  }
} 