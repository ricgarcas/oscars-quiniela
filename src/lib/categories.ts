export interface Category {
  id: string;
  name: string;
  nominees: string[];
}

export const categories: Category[] = [
  {
    id: "best-picture",
    name: "Best Picture",
    nominees: [
      "Bugonia",
      "F1",
      "Frankenstein",
      "Hamnet",
      "Marty Supreme",
      "One Battle After Another",
      "The Secret Agent",
      "Sentimental Value",
      "Sinners",
      "Train Dreams",
    ],
  },
  {
    id: "directing",
    name: "Directing",
    nominees: [
      "Chloé Zhao – Hamnet",
      "Josh Safdie – Marty Supreme",
      "Paul Thomas Anderson – One Battle After Another",
      "Joachim Trier – Sentimental Value",
      "Ryan Coogler – Sinners",
    ],
  },
  {
    id: "actor-leading",
    name: "Actor in a Leading Role",
    nominees: [
      "Timothée Chalamet – Marty Supreme",
      "Leonardo DiCaprio – One Battle After Another",
      "Ethan Hawke – Blue Moon",
      "Michael B. Jordan – Sinners",
      "Wagner Moura – The Secret Agent",
    ],
  },
  {
    id: "actress-leading",
    name: "Actress in a Leading Role",
    nominees: [
      "Jessie Buckley – Hamnet",
      "Rose Byrne – If I Had Legs I'd Kick You",
      "Kate Hudson – Song Sung Blue",
      "Renate Reinsve – Sentimental Value",
      "Emma Stone – Bugonia",
    ],
  },
  {
    id: "actor-supporting",
    name: "Actor in a Supporting Role",
    nominees: [
      "Benicio Del Toro – One Battle After Another",
      "Jacob Elordi – Frankenstein",
      "Delroy Lindo – Sinners",
      "Sean Penn – One Battle After Another",
      "Stellan Skarsgård – Sentimental Value",
    ],
  },
  {
    id: "actress-supporting",
    name: "Actress in a Supporting Role",
    nominees: [
      "Elle Fanning – Sentimental Value",
      "Inga Ibsdotter Lilleaas – Sentimental Value",
      "Amy Madigan – Weapons",
      "Wunmi Mosaku – Sinners",
      "Teyana Taylor – One Battle After Another",
    ],
  },
  {
    id: "writing-original",
    name: "Writing (Original Screenplay)",
    nominees: [
      "Blue Moon",
      "It Was Just an Accident",
      "Marty Supreme",
      "Sentimental Value",
      "Sinners",
    ],
  },
  {
    id: "writing-adapted",
    name: "Writing (Adapted Screenplay)",
    nominees: [
      "Bugonia",
      "Frankenstein",
      "Hamnet",
      "One Battle After Another",
      "Train Dreams",
    ],
  },
  {
    id: "animated-feature",
    name: "Animated Feature Film",
    nominees: [
      "Arco",
      "Elio",
      "KPop Demon Hunters",
      "Little Amélie or the Character of Rain",
      "Zootopia 2",
    ],
  },
  {
    id: "music-original-score",
    name: "Music (Original Score)",
    nominees: [
      "Jerskin Fendrix – Bugonia",
      "Alexandre Desplat – Frankenstein",
      "Max Richter – Hamnet",
      "Jonny Greenwood – One Battle After Another",
      "Ludwig Göransson – Sinners",
    ],
  },
  {
    id: "international-feature",
    name: "International Feature Film",
    nominees: [
      "The Secret Agent",
      "It Was Just an Accident",
      "Sentimental Value",
      "Sirât",
      "The Voice of Hind Rajab",
    ],
  },
  {
    id: "cinematography",
    name: "Cinematography",
    nominees: [
      "Frankenstein",
      "Marty Supreme",
      "One Battle After Another",
      "Sinners",
      "Train Dreams",
    ],
  },
];
