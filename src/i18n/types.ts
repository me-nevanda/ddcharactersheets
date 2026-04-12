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
      sections: {
        general: string
        attributes: string
        defenses: string
        training: string
      }
      fields: {
        name: string
        level: string
        speed: string
        race: string
        class: string
        strength: string
        constitution: string
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
