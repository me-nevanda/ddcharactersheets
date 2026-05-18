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
      print: string
      save: string
      backToList: string
    }
    editor: {
      bold: string
      italic: string
      underline: string
      bulletList: string
      numberedList: string
      clearFormatting: string
    }
    states: {
      creating: string
      deleting: string
      loadingCards: string
      loadingCharacter: string
      loadingMonsters: string
      saving: string
    }
  }
  errors: {
    api: {
      generic: string
      invalidCharacterId: string
      invalidMonsterId: string
      invalidJsonBody: string
      invalidMonsterImage: string
      characterNotFound: string
      monsterNotFound: string
      notFound: string
      unexpectedServerError: string
    }
  }
  pages: {
    main: {
      subtitle: string
      tabsLabel: string
      tabs: {
        heroes: string
        monsters: string
      }
    }
    characterList: {
      actions: {
        addHero: string
        addMonster: string
      }
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
    monsterList: {
      emptyState: string
      unnamedMonster: string
      deleteDialog: {
        title: string
        body: string
      }
    }
    monsterEdit: {
      eyebrow: string
      title: string
      loading: string
      tabs: {
        general: string
        attacks: string
        loot: string
      }
      sections: {
        defenses: string
        description: string
        resistances: string
        special: string
      }
      attacks: {
        title: string
        emptyState: string
        addButton: string
        removeButton: string
        typeLabel: string
        typeOptions: {
          standard: string
          unlimited: string
          encounter: string
          daily: string
        }
        attackLabel: string
        namePlaceholder: string
        descriptionPlaceholder: string
      }
      loot: {
        title: string
        emptyState: string
        addButton: string
        groups: {
          armors: string
          weapons: string
          others: string
        }
        removeDialog: {
          title: string
          body: string
        }
      }
      fields: {
        name: string
        image: string
        description: string
        kp: string
        fortitude: string
        reflex: string
        will: string
        speed: string
        hp: string
        level: string
        bloodied: string
      }
      placeholders: {
        titleName: string
        image: string
        description: string
        resistances: string
        special: string
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
      printMenu: {
        characterSheet: string
        abilitiesAndFeats: string
        items: string
      }
      sections: {
        general: string
        attributes: string
        defenses: string
        description: string
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
        armorPenalty: string
      }
      sourceTooltip: {
        raceBonus: string
        itemBonus: string
        featBonuses: string
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
        areaLabel: string
        actionOptions: {
          action: string
          noAction: string
        }
        weaponRangeLabel: string
        weaponAreaLabel: string
        typeLabel: string
        typeOptions: {
          standard: string
          unlimited: string
          encounter: string
          daily: string
        }
        kindLabel: string
        kindOptions: {
          offensive: string
          utility: string
        }
        weaponAttackAttributeLabel: string
        weaponAttackBonusLabel: string
        weaponAgainstLabel: string
        weaponAttackDefenseLabel: string
        weaponLabel: string
        attackLabel: string
        weaponDamageDiceLabel: string
        weaponDamageCountLabel: string
        weaponDamageTypeLabel: string
        weaponRecurringDamageLabel: string
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
      feats: {
        title: string
        emptyState: string
        addButton: string
        removeButton: string
        visibleLabel: string
        invisibleLabel: string
        removeDialog: {
          title: string
          body: string
        }
        nameLabel: string
        namePlaceholder: string
        descriptionLabel: string
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
        addBonusButton: string
        bonusTypeLabel: string
        bonusValueLabel: string
        equippedLabel: string
        unequippedLabel: string
        namePlaceholder: string
        descriptionPlaceholder: string
      }
      fields: {
        name: string
        description: string
        level: string
        speed: string
        hp: string
        surge: string
        race: string
        class: string
        gender: string
        alignment: string
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
        armorPenalty: string
        acrobatics: string
        arcana: string
        athletics: string
        diplomacy: string
        history: string
        healing: string
        deception: string
        perception: string
        endurance: string
        dungeons: string
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
        description: string
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
        gender: {
          male: string
          female: string
          unspecified: string
        }
        alignment: {
          lawfulGood: string
          lawfulNeutral: string
          lawfulEvil: string
          neutralGood: string
          trueNeutral: string
          neutralEvil: string
          chaoticGood: string
          chaoticNeutral: string
          chaoticEvil: string
        }
      }
    }
    characterPrint: {
      title: string
      loading: string
      error: string
      pdLabel: string
      printButtonLabel: string
    }
    characterAbilitiesPrint: {
      title: string
      loading: string
      error: string
      printButtonLabel: string
      emptyState: string
      attackLabel: string
      damageLabel: string
      damageParts: {
        recurring: string
        type: string
      }
      sections: {
        standard: string
        unlimited: string
        encounter: string
        daily: string
        feats: string
      }
    }
    characterItemsPrint: {
      title: string
      loading: string
      error: string
      printButtonLabel: string
      emptyState: string
      extraSlots: {
        goldCoins: string
      }
      sections: {
        armors: string
        weapons: string
        others: string
      }
    }
    monsterPrint: {
      title: string
      loading: string
      error: string
      printButtonLabel: string
      emptyAttacks: string
      unnamedAttack: string
      sections: {
        stats: string
        attacks: string
      }
    }
  }
}
