import { INITIALS, MEDIALS, FINALS } from '../constants';
import { PuzzlePiece } from '../types';

const BASE_CODE = 0xAC00; // '가'

// Mappings for combining separate chips into composite Jamos
const COMPLEX_VOWELS: Record<string, string> = {
  'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ',
  'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ',
  'ㅡㅣ': 'ㅢ'
};

const COMPLEX_FINALS: Record<string, string> = {
  'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 
  'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 
  'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ'
};

/**
 * Checks if a character is a consonant.
 */
export const isConsonant = (char: string) => {
  // Simple check against Initials/Finals list, or known complex finals
  return INITIALS.includes(char) || FINALS.includes(char) || Object.values(COMPLEX_FINALS).includes(char);
};

/**
 * Checks if a character is a vowel.
 */
export const isVowel = (char: string) => {
  return MEDIALS.includes(char) || Object.values(COMPLEX_VOWELS).includes(char);
};

/**
 * Combines Jamo into a Hangul syllable.
 */
export const composeHangul = (initial: string, medial: string, final: string = ''): string | null => {
  const initialIdx = INITIALS.indexOf(initial);
  const medialIdx = MEDIALS.indexOf(medial);
  const finalIdx = FINALS.indexOf(final);

  if (initialIdx === -1 || medialIdx === -1) return null;
  // If final is provided but invalid (e.g. not a valid final consonant), ignore it or fail
  // For forgiveness, if final is invalid, we might just form Initial+Medial, but let's be strict for learning.
  const validFinalIdx = finalIdx === -1 ? 0 : finalIdx;

  const charCode = BASE_CODE + (initialIdx * 588) + (medialIdx * 28) + validFinalIdx;
  return String.fromCharCode(charCode);
};

/**
 * Improved Spatial Scanning Algorithm
 */
export const scanBoard = (pieces: PuzzlePiece[]): string => {
  if (pieces.length === 0) return '';

  // 1. Cluster pieces based on spatial proximity (Euclidean distance)
  // This allows "blocks" to be formed anywhere on the canvas
  const clusters: PuzzlePiece[][] = [];
  const visited = new Set<string>();
  const DISTANCE_THRESHOLD = 110; // Approx 1.5x chip width

  pieces.forEach(p => {
    if (visited.has(p.id)) return;

    const cluster: PuzzlePiece[] = [p];
    visited.add(p.id);
    const queue = [p];

    while (queue.length > 0) {
      const current = queue.shift()!;
      pieces.forEach(other => {
        if (!visited.has(other.id)) {
          const dx = current.x - other.x;
          const dy = current.y - other.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < DISTANCE_THRESHOLD) {
            visited.add(other.id);
            cluster.push(other);
            queue.push(other);
          }
        }
      });
    }
    clusters.push(cluster);
  });

  // 2. Sort clusters from Left to Right (primary) and Top to Bottom (secondary)
  // to determine reading order of the words
  clusters.sort((a, b) => {
    const centerA = getCenter(a);
    const centerB = getCenter(b);
    // Tolerance for "same line" verticality
    if (Math.abs(centerA.y - centerB.y) > 100) {
        return centerA.y - centerB.y;
    }
    return centerA.x - centerB.x;
  });

  // 3. Process each cluster into a character
  let resultString = '';
  for (const cluster of clusters) {
    resultString += processCluster(cluster);
  }
  
  return resultString;
};

// Helper: Get geometric center of a group of pieces
const getCenter = (pieces: PuzzlePiece[]) => {
    const sum = pieces.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: sum.x / pieces.length, y: sum.y / pieces.length };
}

// Logic to turn a group of chips into a Hangul Char
const processCluster = (cluster: PuzzlePiece[]): string => {
    const rawConsonants = cluster.filter(p => !isVowel(p.char)); // Assume anything not vowel is consonant
    const rawVowels = cluster.filter(p => isVowel(p.char));

    if (rawVowels.length === 0) {
        // No vowel -> just return consonants as is
        return rawConsonants.map(p => p.char).join('');
    }

    // --- Step A: Merge Vowels ---
    let medialChar = '';
    let medialCenterY = 0;
    
    if (rawVowels.length >= 2) {
        // Sort Left-to-Right or Top-to-Bottom to match keys
        // Heuristic: Sort by X first. 
        rawVowels.sort((a, b) => a.x - b.x);
        const key = rawVowels.map(v => v.char).join('');
        
        if (COMPLEX_VOWELS[key]) {
            medialChar = COMPLEX_VOWELS[key];
        } else {
            // Try sorting by Y (vertical combination like ㅗ over ㅏ?) - usually standard keys cover this via ordering
            // Fallback: Just take the first one
            medialChar = rawVowels[0].char; 
        }
    } else {
        medialChar = rawVowels[0].char;
    }
    
    // Calculate Vowel Center (used to judge Initial vs Final)
    const vCenter = getCenter(rawVowels);
    medialCenterY = vCenter.y;

    if (rawConsonants.length === 0) {
        return medialChar;
    }

    // --- Step B: Split Consonants into Initial and Final ---
    // Initial: Typically ABOVE the vowel center (or same level for left-side initials)
    // Final: Typically strictly BELOW the vowel center
    
    const initials: PuzzlePiece[] = [];
    const finals: PuzzlePiece[] = [];

    // Threshold: a consonant is a Final if its center is significantly below the vowel's center
    // Chip height is 64. Half is 32. 
    const FINAL_THRESHOLD_Y = 20; 

    rawConsonants.forEach(c => {
        if (c.y > medialCenterY + FINAL_THRESHOLD_Y) {
            finals.push(c);
        } else {
            initials.push(c);
        }
    });

    // --- Step C: Merge/Select Initial ---
    let initialChar = '';
    if (initials.length > 0) {
        // If multiple initials (unlikely for valid block, but maybe user put 2), take Top/Left most
        initials.sort((a, b) => a.x - b.x); // Leftmost
        initialChar = initials[0].char;
    }

    // --- Step D: Merge/Select Final ---
    let finalChar = '';
    if (finals.length > 0) {
        if (finals.length >= 2) {
            // Check for complex final (e.g. ㄳ)
            finals.sort((a, b) => a.x - b.x);
            const key = finals.map(f => f.char).join('');
            if (COMPLEX_FINALS[key]) {
                finalChar = COMPLEX_FINALS[key];
            } else {
                finalChar = finals[0].char; // Fallback
            }
        } else {
            finalChar = finals[0].char;
        }
    }

    if (!initialChar) {
        // Vowel + Final? Invalid. Just return parts.
        return medialChar + (finalChar || ''); 
    }

    // --- Step E: Compose ---
    const result = composeHangul(initialChar, medialChar, finalChar);
    if (result) return result;

    // Fallback
    return cluster.map(p => p.char).join('');
}