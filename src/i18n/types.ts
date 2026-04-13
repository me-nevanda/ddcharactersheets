export type Locale = 'pl' | 'en'

export type TranslationVariables = Record<string, string | number>

export interface TranslationDictionary {
  localeName: string
  common: {
    language: string
    languages: Record<Locale, string>
    actions: {
      addCard: string
      cancel: string
      delete: string
      edit: string
      save: string
      backToList: string
    }
    states: {
      creating: string
      deleting: string
      loadingCards: string
      loadingCharacter: string
      saving: string
    }
  }
  errors: {
    api: {
      generic: string
      invalidCharacterId: string
      invalidJsonBody: string
      characterNotFound: string
      notFound: string
      unexpectedServerError: string
    }
  }
  pages: {
    characterList: {
      eyebrow: string
      title: string
      emptyState: string
      unnamedCharacter: string
      missingRace: string
      missingClass: string
      missingUpdatedAt: string
      deleteDialog: {
        title: string
        body: string
      }
    }
    characterEdit: {
      eyebrow: string
      title: string
      tabs: {
        general: string
        abilities: string
        feats: string
        items: string
      }
      sections: {
        general: string
        attributes: string
        defenses: string
        skills: string
      }
      defenseTooltip: {
        levelBonus: string
        classBonus: string
        attributesBonus: string
        itemsBonus: string
      }
      skillTooltip: {
        trainingBonus: string
      }
      sourceTooltip: {
        raceBonus: string
        itemBonus: string
        baseSpeed: string
      }
      abilities: {
        title: string
        emptyState: string
        addTitle: string
        addButton: string
        removeButton: string
        removeConfirm: string
        removeDialog: {
          title: string
          body: string
        }
        actionLabel: string
        actionOptions: {
          action: string
          noAction: string
        }
        weaponRangeLabel: string
        weaponAreaLabel: string
        typeLabel: string
        typeOptions: {
          unlimited: string
          encounter: string
          daily: string
        }
        kindLabel: string
        kindOptions: {
          offensive: string
          utility: string
        }
        weaponLabel: string
        weaponDamageDiceLabel: string
        weaponDamageCountLabel: string
        weaponDamageTypeLabel: string
        weaponBonusOptions: {
          none: string
          prefix: string
        }
        weaponDamageDiceOptions: {
          none: string
          d4: string
          d6: string
          d8: string
          d10: string
          d12: string
          d20: string
        }
        weaponDamageTypeOptions: {
          normal: string
          acid: string
          cold: string
          fire: string
          force: string
          lightning: string
          necrotic: string
          poison: string
          psychic: string
          radiant: string
          thunder: string
        }
        weaponAreaOptions: {
          point: string
          burst: string
          blast: string
        }
        weaponHitLabel: string
        weaponMissLabel: string
        weaponProvocationLabel: string
        weaponOptions: {
          none: string
        }
        nameLabel: string
        descriptionLabel: string
        namePlaceholder: string
        descriptionPlaceholder: string
      }
      items: {
        title: string
        emptyState: string
        addButton: string
        removeButton: string
        groups: {
          armors: string
          weapons: string
          others: string
        }
        weaponBonus: {
          none: string
        }
        removeDialog: {
          title: string
          body: string
        }
        nameLabel: string
        descriptionLabel: string
        damageLabel: string
        rangeLabel: string
        proficiencyLabel: string
        bonusesLabel: string
        equippedLabel: string
        unequippedLabel: string
        namePlaceholder: string
        descriptionPlaceholder: string
      }
      fields: {
        name: string
        level: string
        speed: string
        hp: string
        surge: string
        race: string
        class: string
        strength: string
        condition: string
        dexterity: string
        intelligence: string
        wisdom: string
        charisma: string
        kp: string
        fortitude: string
        reflex: string
        will: string
        acrobatics: string
        arcana: string
        athletics: string
        diplomacy: string
        history: string
        healing: string
        deception: string
        perception: string
        endurance: string
        dungeoneering: string
        nature: string
        religion: string
        insight: string
        stealth: string
        streetwise: string
        intimidation: string
        thievery: string
      }
      placeholders: {
        name: string
        titleName: string
        race: string
        class: string
      }
      options: {
        race: {
          human: string
          tiefling: string
          dragonborn: string
          eladrin: string
          elf: string
          dwarf: string
          halfling: string
          halfElf: string
        }
        class: {
          warlock: string
          wizard: string
          warlord: string
          bard: string
          cleric: string
          rogue: string
          ranger: string
          paladin: string
          fighter: string
          barbarian: string
        }
      }
    }
  }
}
