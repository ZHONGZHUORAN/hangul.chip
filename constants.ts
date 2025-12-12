import { JamoData } from './types';

export const INITIALS: string[] = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

export const MEDIALS: string[] = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

export const FINALS: string[] = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

export const JAMO_LIST: JamoData[] = [
  // Consonants (Standard Order)
  { char: 'ㄱ', name: 'Giyok', romaja: 'g/k', type: ['initial', 'final'] },
  { char: 'ㄲ', name: 'SsangGiyok', romaja: 'kk', type: ['initial', 'final'] },
  { char: 'ㄴ', name: 'Nieun', romaja: 'n', type: ['initial', 'final'] },
  { char: 'ㄷ', name: 'Digeut', romaja: 'd/t', type: ['initial', 'final'] },
  { char: 'ㄸ', name: 'SsangDigeut', romaja: 'tt', type: ['initial'] },
  { char: 'ㄹ', name: 'Rieul', romaja: 'r/l', type: ['initial', 'final'] },
  { char: 'ㅁ', name: 'Mieum', romaja: 'm', type: ['initial', 'final'] },
  { char: 'ㅂ', name: 'Bieup', romaja: 'b/p', type: ['initial', 'final'] },
  { char: 'ㅃ', name: 'SsangBieup', romaja: 'pp', type: ['initial'] },
  { char: 'ㅅ', name: 'Siot', romaja: 's', type: ['initial', 'final'] },
  { char: 'ㅆ', name: 'SsangSiot', romaja: 'ss', type: ['initial', 'final'] },
  { char: 'ㅇ', name: 'Ieung', romaja: 'ng/-', type: ['initial', 'final'] },
  { char: 'ㅈ', name: 'Jieut', romaja: 'j', type: ['initial', 'final'] },
  { char: 'ㅉ', name: 'SsangJieut', romaja: 'jj', type: ['initial'] },
  { char: 'ㅊ', name: 'Chieut', romaja: 'ch', type: ['initial', 'final'] },
  { char: 'ㅋ', name: 'Kieuk', romaja: 'k', type: ['initial', 'final'] },
  { char: 'ㅌ', name: 'Tieut', romaja: 't', type: ['initial', 'final'] },
  { char: 'ㅍ', name: 'Pieup', romaja: 'p', type: ['initial', 'final'] },
  { char: 'ㅎ', name: 'Hieut', romaja: 'h', type: ['initial', 'final'] },
  
  // Vowels (Standard Order)
  { char: 'ㅏ', name: 'A', romaja: 'a', type: ['medial'] },
  { char: 'ㅐ', name: 'Ae', romaja: 'ae', type: ['medial'] },
  { char: 'ㅑ', name: 'Ya', romaja: 'ya', type: ['medial'] },
  { char: 'ㅒ', name: 'Yae', romaja: 'yae', type: ['medial'] },
  { char: 'ㅓ', name: 'Eo', romaja: 'eo', type: ['medial'] },
  { char: 'ㅔ', name: 'E', romaja: 'e', type: ['medial'] },
  { char: 'ㅕ', name: 'Yeo', romaja: 'yeo', type: ['medial'] },
  { char: 'ㅖ', name: 'Ye', romaja: 'ye', type: ['medial'] },
  { char: 'ㅗ', name: 'O', romaja: 'o', type: ['medial'] },
  { char: 'ㅛ', name: 'Yo', romaja: 'yo', type: ['medial'] },
  { char: 'ㅜ', name: 'U', romaja: 'u', type: ['medial'] },
  { char: 'ㅠ', name: 'Yu', romaja: 'yu', type: ['medial'] },
  { char: 'ㅡ', name: 'Eu', romaja: 'eu', type: ['medial'] },
  { char: 'ㅣ', name: 'I', romaja: 'i', type: ['medial'] },
];