import { HugeiconsIcon } from '@hugeicons/react';
import { AddCircleIcon, AxeIcon, BookOpen01Icon, Calendar03Icon, CheckCircle, Circle, CrownIcon, Delete, FileText, LongSleeveShirtIcon, MagicWand01Icon, MapPinIcon, MoneyBagIcon, NecklaceIcon, PencilEdit01Icon, Printer, Save, Shield, Sword, UserGroupIcon, UserIcon, } from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';
import type { AppIconProps } from './types';
import styles from './style.module.scss';
const iconMap: Record<Exclude<AppIconProps['name'], 'map'>, IconSvgElement> = {
    coins: MoneyBagIcon,
    check: CheckCircle,
    clothes: LongSleeveShirtIcon,
    circle: Circle,
    context: BookOpen01Icon,
    crown: CrownIcon,
    delete: Delete,
    document: FileText,
    edit: PencilEdit01Icon,
    event: Calendar03Icon,
    group: UserGroupIcon,
    magic: MagicWand01Icon,
    minion: UserIcon,
    monster: AxeIcon,
    area: MapPinIcon,
    plus: AddCircleIcon,
    print: Printer,
    save: Save,
    shield: Shield,
    solo: Sword,
    shirt: NecklaceIcon,
    sword: Sword,
    trash: Delete,
};

const MedievalMapIcon = ({ className }: { className: string }) => (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
        <path d="M3.5 5.5L8.8 3.4L15.2 5.6L20.5 3.5V18.5L15.2 20.6L8.8 18.4L3.5 20.5V5.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7"/>
        <path d="M8.8 3.4V18.4M15.2 5.6V20.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4"/>
        <path d="M6.1 8.4C7.4 7.5 8.9 7.7 10 8.8C11.3 10.1 12.4 10 13.8 8.8C15 7.8 16.6 7.9 17.9 9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35"/>
        <path d="M6.2 15.8C7.7 14.9 9.2 15.2 10.5 16.3C11.8 17.4 13.3 17.3 14.6 16.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35"/>
        <path d="M17.2 13.4L19 15.2M19 13.4L17.2 15.2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5"/>
        <path d="M5.9 11.7H7.2M11.7 13.1H13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35"/>
    </svg>
);

export const AppIcon = ({ className, name }: AppIconProps) => {
    const iconClassName = [styles.icon, className].filter(Boolean).join(' ');
    if (name === 'map') {
        return <MedievalMapIcon className={iconClassName}/>;
    }
    return (<HugeiconsIcon aria-hidden="true" className={iconClassName} color="currentColor" icon={iconMap[name]} strokeWidth={1.9}/>);
};
