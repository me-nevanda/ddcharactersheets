import { HugeiconsIcon } from '@hugeicons/react';
import { AddCircleIcon, AxeIcon, CheckCircle, Circle, ClothesIcon, CrownIcon, Delete, FileText, LongSleeveShirtIcon, MagicWand01Icon, MapPinIcon, MoneyBagIcon, NecklaceIcon, PencilEdit01Icon, Plus, Printer, Save, Shield, Sword, UserIcon, VestIcon, } from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';
import type { AppIconProps } from './types';
import styles from './style.module.scss';
const iconMap: Record<AppIconProps['name'], IconSvgElement> = {
    coins: MoneyBagIcon,
    check: CheckCircle,
    clothes: LongSleeveShirtIcon,
    circle: Circle,
    crown: CrownIcon,
    delete: Delete,
    document: FileText,
    edit: PencilEdit01Icon,
    magic: MagicWand01Icon,
    minion: UserIcon,
    monster: AxeIcon,
    place: MapPinIcon,
    plus: AddCircleIcon,
    print: Printer,
    save: Save,
    shield: Shield,
    solo: Sword,
    shirt: NecklaceIcon,
    sword: Sword,
    trash: Delete,
};
export const AppIcon = ({ className, name }: AppIconProps) => {
    const iconClassName = [styles.icon, className].filter(Boolean).join(' ');
    return (<HugeiconsIcon aria-hidden="true" className={iconClassName} color="currentColor" icon={iconMap[name]} strokeWidth={1.9}/>);
};
