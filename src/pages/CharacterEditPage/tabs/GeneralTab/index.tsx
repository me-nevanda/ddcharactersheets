import { AttributesSection } from '../../sections/AttributesSection';
import { DefensesSection } from '../../sections/DefensesSection';
import { GeneralSection } from '../../sections/GeneralSection';
import { SkillSection } from '../../sections/SkillSection';
import styles from '../../style.module.scss';
export const GeneralTab = () => {
    return (<div className={styles.sectionsGrid}>
      <div className={styles.sectionColumn}>
        <GeneralSection />
        <DefensesSection />
      </div>
      <div className={styles.sectionColumn}>
        <AttributesSection />
        <SkillSection />
      </div>
    </div>);
};
