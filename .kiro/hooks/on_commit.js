/**
 * NecroNet - on_commit Hook
 * 
 * Triggered when a git commit is made.
 * Transforms commit messages into occult style with skull emojis,
 * ritualistic language, and ASCII art.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 9.2, 9.4
 */

/**
 * Transform a regular commit message into occult style
 * 
 * @param {string} message - Original commit message
 * @returns {string} Transformed message with occult styling
 */
function transformToOccult(message) {
  // Mapping of common commit words to occult equivalents
  const occultMap = {
    'add': 'summon',
    'added': 'summoned',
    'create': 'conjure',
    'created': 'conjured',
    'update': 'transmute',
    'updated': 'transmuted',
    'fix': 'banish',
    'fixed': 'banished',
    'remove': 'exorcise',
    'removed': 'exorcised',
    'delete': 'obliterate',
    'deleted': 'obliterated',
    'refactor': 'reshape',
    'refactored': 'reshaped',
    'improve': 'empower',
    'improved': 'empowered',
    'implement': 'manifest',
    'implemented': 'manifested',
    'merge': 'bind',
    'merged': 'bound',
    'test': 'divine',
    'tested': 'divined',
    'deploy': 'unleash',
    'deployed': 'unleashed',
    'install': 'invoke',
    'installed': 'invoked',
    'configure': 'enchant',
    'configured': 'enchanted',
    'optimize': 'enhance',
    'optimized': 'enhanced',
    'debug': 'purify',
    'debugged': 'purified',
    'build': 'forge',
    'built': 'forged',
    'release': 'liberate',
    'released': 'liberated',
  };
  
  // Transform the message
  let transformed = message.toLowerCase();
  
  // Replace common words with occult equivalents
  for (const [normal, occult] of Object.entries(occultMap)) {
    const regex = new RegExp(`\\b${normal}\\b`, 'gi');
    transformed = transformed.replace(regex, occult);
  }
  
  // Capitalize first letter
  transformed = transformed.charAt(0).toUpperCase() + transformed.slice(1);
  
  // Add mystical prefixes based on commit type
  if (transformed.includes('summon') || transformed.includes('conjure')) {
    transformed = `🔮 ${transformed}`;
  } else if (transformed.includes('banish') || transformed.includes('exorcise')) {
    transformed = `⚔️ ${transformed}`;
  } else if (transformed.includes('transmute') || transformed.includes('reshape')) {
    transformed = `✨ ${transformed}`;
  } else if (transformed.includes('manifest') || transformed.includes('forge')) {
    transformed = `🛠️ ${transformed}`;
  } else if (transformed.includes('unleash') || transformed.includes('liberate')) {
    transformed = `🚀 ${transformed}`;
  } else {
    transformed = `⚡ ${transformed}`;
  }
  
  // Add mystical suffix
  const suffixes = [
    'from the void',
    'through dark rituals',
    'by ancient powers',
    'with necromantic force',
    'from the shadow realm',
    'through arcane knowledge',
    'by the will of darkness',
    'from beyond the veil',
  ];
  
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  // Only add suffix if message is short enough
  if (transformed.length < 60) {
    transformed = `${transformed} ${randomSuffix}`;
  }
  
  return transformed;
}

/**
 * Generate ASCII skull art for terminal display
 * 
 * @returns {string} ASCII art with skulls and ritual symbols
 */
function generateSkullArt() {
  const arts = [
    // Classic skull
    `
    ☠️ ═══════════════════════════════════════ ☠️
         ___
        /   \\
       | O O |     COMMIT TO THE DARKNESS
       |  ^  |
       | \\_/ |     The code has been sealed
        \\___/      in the eternal repository
    ☠️ ═══════════════════════════════════════ ☠️
    `,
    
    // Ritual circle
    `
    ☠️ ═══════════════════════════════════════ ☠️
           ✦ ✧ ✦
         ✧   ☠️   ✧
        ✦  RITUAL  ✦      Your changes have been
         ✧ COMPLETE ✧     bound to the repository
           ✦ ✧ ✦          by dark magic
    ☠️ ═══════════════════════════════════════ ☠️
    `,
    
    // Necromancer's seal
    `
    ☠️ ═══════════════════════════════════════ ☠️
          ╔═══════╗
          ║ ☠️ ⚡ ☠️ ║
          ║  SEALED  ║      The commit has been
          ║ ☠️ ⚡ ☠️ ║      inscribed in the
          ╚═══════╝        Book of Shadows
    ☠️ ═══════════════════════════════════════ ☠️
    `,
    
    // Simple and elegant
    `
    ☠️ ═══════════════════════════════════════ ☠️
    
         💀  C O M M I T T E D  💀
         
         The ritual is complete.
         Your code now dwells in darkness.
    
    ☠️ ═══════════════════════════════════════ ☠️
    `,
    
    // Mystical runes
    `
    ☠️ ═══════════════════════════════════════ ☠️
         ᚱ ᚢ ᚾ ᛖ ᛋ
         
         ⚡ BOUND BY ANCIENT RUNES ⚡
         
         Your changes are now eternal
         in the repository of souls
    ☠️ ═══════════════════════════════════════ ☠️
    `,
  ];
  
  // Return a random skull art
  return arts[Math.floor(Math.random() * arts.length)];
}

/**
 * Play ritual sound effect (optional)
 * This is a placeholder - actual implementation would use system audio
 * 
 * @returns {boolean} Success status
 */
function playRitualSound() {
  // In a real implementation, this would play an audio file
  // For now, we'll just log that it would play
  console.log('🔊 [RITUAL SOUND EFFECT WOULD PLAY HERE]');
  console.log('   (Imagine: deep gong, mystical chimes, whispered incantations)');
  return true;
}

/**
 * Get commit statistics for display
 * 
 * @param {Object} context - Hook context
 * @returns {Object} Commit statistics
 */
function getCommitStats(context) {
  const stats = {
    filesChanged: context.files?.length || 0,
    insertions: context.insertions || 0,
    deletions: context.deletions || 0,
    timestamp: new Date().toISOString(),
  };
  
  return stats;
}

/**
 * Format commit statistics in occult style
 * 
 * @param {Object} stats - Commit statistics
 * @returns {string} Formatted statistics
 */
function formatOccultStats(stats) {
  return `
    📊 Ritual Statistics:
       • Artifacts touched: ${stats.filesChanged}
       • Souls summoned: +${stats.insertions}
       • Spirits banished: -${stats.deletions}
       • Sealed at: ${new Date(stats.timestamp).toLocaleString()}
  `;
}

/**
 * Main hook handler
 * 
 * @param {Object} context - Hook context with commit information
 * @returns {Promise<Object>} Result with transformed message and art
 */
module.exports = async function onCommit(context) {
  try {
    console.log('\n☠️ === COMMIT TO THE DARKNESS === ☠️\n');
    
    const { message, branch, author } = context;
    
    if (!message) {
      throw new Error('No commit message provided');
    }
    
    // Transform the commit message
    const occultMessage = transformToOccult(message);
    
    // Generate ASCII art
    const art = generateSkullArt();
    
    // Get commit statistics
    const stats = getCommitStats(context);
    
    // Display the art
    console.log(art);
    
    // Display the transformed message
    console.log(`\n  Original: "${message}"`);
    console.log(`  Occult:   "${occultMessage}"\n`);
    
    // Display statistics
    console.log(formatOccultStats(stats));
    
    // Optional: play sound effect if enabled
    if (context.config?.commitToDarkness === true) {
      console.log('\n🔊 Ritual sound effects enabled...\n');
      playRitualSound();
    }
    
    // Display branch and author info
    if (branch) {
      console.log(`  📍 Branch: ${branch}`);
    }
    if (author) {
      console.log(`  👤 Necromancer: ${author}`);
    }
    
    console.log('\n☠️ === THE RITUAL IS COMPLETE === ☠️\n');
    
    return {
      success: true,
      originalMessage: message,
      occultMessage: occultMessage,
      art: art,
      stats: stats,
      message: '☠️ Your commit has been sealed in the eternal repository ☠️',
    };
    
  } catch (error) {
    console.error('💀 COMMIT RITUAL FAILED:', error.message);
    
    return {
      success: false,
      error: error.message,
      message: '💀 The commit ritual has been disrupted 💀',
      originalMessage: context.message,
    };
  }
};

// Export helper functions for testing
module.exports.transformToOccult = transformToOccult;
module.exports.generateSkullArt = generateSkullArt;
module.exports.playRitualSound = playRitualSound;
