import { AttributesSection } from '../../sections/AttributesSection'
import { DefensesSection } from '../../sections/DefensesSection'
import { GeneralSection } from '../../sections/GeneralSection'
import { SkillSection } from '../../sections/SkillSection'
import styles from '../../style.module.scss'

export function GeneralTab() {
  return (
    <div className={styles.sectionsGrid}>
      <GeneralSection />
      <AttributesSection />
      <DefensesSection />
      <SkillSection />
    </div>
  )
}
