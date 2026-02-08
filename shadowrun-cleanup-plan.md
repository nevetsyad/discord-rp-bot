# Shadowrun Bot Cleanup Plan

## 🎯 Analysis Summary

### Current Issues Identified
1. **Massive shadowrun.js file**: 511 lines, 22KB - needs modularization
2. **Duplicate dice commands**: dice.js (general) vs shadowrun-dice.js (Shadowrun-specific)
3. **Duplicate test files**: 3 different Phase1 test files with overlapping functionality
4. **Duplicate character models**: Character.js (general) vs ShadowrunCharacter.js (specific)
5. **Large docs folder**: 56K with multiple overlapping documentation files
6. **Redundant setup files**: Multiple setup scripts with similar functionality

### Cleanup Strategy

#### Phase 1: Code Modularization
- **Split shadowrun.js** into smaller, focused modules
- **Consolidate dice commands** - keep shadowrun-dice.js, remove or merge dice.js
- **Merge character models** - keep ShadowrunCharacter.js, remove Character.js
- **Remove test files** - keep only comprehensive test file

#### Phase 2: Documentation Cleanup
- **Consolidate docs** - merge overlapping documentation
- **Remove redundant files** - single source of truth
- **Update references** - ensure all imports/exports are correct

#### Phase 3: File Organization
- **Clean up root directory** - remove unnecessary files
- **Consolidate setup scripts** - single comprehensive setup
- **Update package.json** - reflect new structure

### Expected Results
- **30-40% code reduction**
- **Better maintainability**
- **Clearer code structure**
- **Reduced complexity**
- **Easier to extend**

---
*Status: Ready for Cleanup*  
*Created: 2026-02-08*