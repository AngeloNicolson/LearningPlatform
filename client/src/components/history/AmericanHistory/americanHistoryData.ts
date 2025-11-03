/**
 * @file americanHistoryData.ts
 * @author Angelo Nicolson
 * @brief American history data and content
 * @description Contains structured data for American history content including eras, events, resources, and timeline information used by AmericanHistory component.
 */

// American History Topics and Resources Data
export const americanHistoryTopics = [
  { id: 'colonial', name: 'Colonial America', icon: '⛵' },
  { id: 'revolution', name: 'Revolutionary War', icon: '🔔' },
  { id: 'early-republic', name: 'Early Republic', icon: '🏛️' },
  { id: 'westward', name: 'Westward Expansion', icon: '🤠' },
  { id: 'civil-war', name: 'Civil War', icon: '⚔️' },
  { id: 'reconstruction', name: 'Reconstruction', icon: '🔨' },
  { id: 'gilded-age', name: 'Gilded Age', icon: '🏭' },
  { id: 'progressive', name: 'Progressive Era', icon: '📰' },
  { id: 'wwi', name: 'World War I', icon: '🎖️' },
  { id: 'roaring-twenties', name: 'Roaring Twenties', icon: '🎺' },
  { id: 'great-depression', name: 'Great Depression', icon: '💵' },
  { id: 'wwii', name: 'World War II', icon: '🪖' },
  { id: 'cold-war', name: 'Cold War', icon: '🧊' },
  { id: 'civil-rights', name: 'Civil Rights', icon: '✊' },
  { id: 'vietnam', name: 'Vietnam War', icon: '🚁' },
  { id: 'modern', name: 'Modern America', icon: '🗽' }
];

export const americanHistoryResources = [
  // Colonial America
  { id: 'col-1', title: 'The First Settlements', description: 'Jamestown, Plymouth, and early colonial life', type: 'video', gradeLevel: '1607-1700', topicName: 'Colonial America', topicIcon: '⛵' },
  { id: 'col-2', title: 'Colonial Economy and Trade', description: 'Triangular trade, mercantilism, and colonial economics', type: 'lessons', gradeLevel: '1650-1750', topicName: 'Colonial America', topicIcon: '⛵' },
  { id: 'col-3', title: 'Life in the 13 Colonies', description: 'Daily life, social structure, and colonial culture', type: 'lessons', gradeLevel: '1700-1770', topicName: 'Colonial America', topicIcon: '⛵' },
  { id: 'col-4', title: 'French and Indian War', description: 'Causes, battles, and consequences', type: 'video', gradeLevel: '1754-1763', topicName: 'Colonial America', topicIcon: '⛵' },

  // Revolutionary War
  { id: 'rev-1', title: 'Road to Revolution', description: 'Taxation without representation and colonial unrest', type: 'lessons', gradeLevel: '1763-1775', topicName: 'Revolutionary War', topicIcon: '🔔' },
  { id: 'rev-2', title: 'Declaration of Independence', description: 'Original document and its meaning', type: 'primary-source', gradeLevel: '1776', topicName: 'Revolutionary War', topicIcon: '🔔' },
  { id: 'rev-3', title: 'Major Battles', description: 'Lexington, Bunker Hill, Yorktown, and more', type: 'video', gradeLevel: '1775-1781', topicName: 'Revolutionary War', topicIcon: '🔔' },
  { id: 'rev-4', title: 'Founding Fathers', description: 'Washington, Jefferson, Franklin, and others', type: 'lessons', gradeLevel: '1770-1790', topicName: 'Revolutionary War', topicIcon: '🔔' },

  // Early Republic
  { id: 'er-1', title: 'The Constitution', description: 'Creation, ratification, and Bill of Rights', type: 'primary-source', gradeLevel: '1787-1791', topicName: 'Early Republic', topicIcon: '🏛️' },
  { id: 'er-2', title: 'First Presidents', description: 'Washington through Jefferson', type: 'video', gradeLevel: '1789-1809', topicName: 'Early Republic', topicIcon: '🏛️' },
  { id: 'er-3', title: 'Louisiana Purchase', description: 'Doubling the size of the nation', type: 'lessons', gradeLevel: '1803', topicName: 'Early Republic', topicIcon: '🏛️' },
  { id: 'er-4', title: 'War of 1812', description: 'The second war for independence', type: 'lessons', gradeLevel: '1812-1815', topicName: 'Early Republic', topicIcon: '🏛️' },

  // Add more eras as needed...
];
