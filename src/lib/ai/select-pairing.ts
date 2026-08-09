import {
  CHARACTER_CONCEPT_POOL,
  type CharacterConceptPairing,
} from "@/lib/anilist/character-pool";
import type { Lesson } from "@/types/database";

export function selectNextPairing(
  previousLesson: Lesson | null,
): CharacterConceptPairing {
  const eligible = CHARACTER_CONCEPT_POOL.filter((pairing) => {
    if (!previousLesson) return true;
    const sameCharacter = pairing.character === previousLesson.character_name;
    const sameConcept = pairing.concept === previousLesson.concept;
    return !sameCharacter && !sameConcept;
  });

  const pool = eligible.length > 0 ? eligible : CHARACTER_CONCEPT_POOL;

  const index = Math.floor(Math.random() * pool.length);
  const pairing = pool[index];
  if (!pairing) {
    throw new Error(
      "Character/concept pool is empty — cannot select a pairing",
    );
  }
  return pairing;
}
