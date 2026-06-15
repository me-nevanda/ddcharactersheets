import { AppIcon } from '@components/AppIcon'
import { useI18n } from '@i18n/index'
import { useMapPrintPage } from './mapPrintPageHooks'
import type { PrintMapLine } from './types'
import styles from './style.module.scss'

const getColorClassName = (color: PrintMapLine['color']) => {
  return styles[`line${color[0].toUpperCase()}${color.slice(1)}`]
}

const getLineClassName = (line: PrintMapLine) => {
  return [
    styles.lineSegment,
    line.orientation === 'horizontal' ? styles.lineSegmentHorizontal : styles.lineSegmentVertical,
    line.orientation === 'horizontal' && line.y === 0 ? styles.lineSegmentTopEdge : '',
    line.orientation === 'horizontal' && line.y === 22 ? styles.lineSegmentBottomEdge : '',
    line.orientation === 'vertical' && line.x === 0 ? styles.lineSegmentLeftEdge : '',
    line.orientation === 'vertical' && line.x === 34 ? styles.lineSegmentRightEdge : '',
    getColorClassName(line.color),
  ].filter(Boolean).join(' ')
}

export const MapPrintPage = () => {
  const { t } = useI18n()
  const { description, elements, error, groundCells, labels, lines, loading, map, mapName, title } = useMapPrintPage()

  if (loading) {
    return (
      <main className={styles.pageShell}>
        <p className={styles.status}>{t('pages.mapPrint.loading')}</p>
      </main>
    )
  }

  if (error || !map) {
    return (
      <main className={styles.pageShell}>
        <p className={styles.status}>{error || t('pages.mapPrint.error')}</p>
      </main>
    )
  }

  return (
    <main className={styles.pageShell}>
      <button className={styles.printButton} type="button" aria-label={t('pages.mapPrint.printButtonLabel')} title={t('pages.mapPrint.printButtonLabel')} onClick={() => window.print()}>
        <span className={styles.printButtonContent}>
          <AppIcon name="print" />
          <span>{t('pages.mapPrint.printButtonLabel')}</span>
        </span>
      </button>

      <article className={styles.sheet}>
        <p className={styles.printHeader}>{`${title} - ${mapName}`}</p>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{title}</p>
            <h1 className={styles.title}>{mapName}</h1>
          </div>
        </header>

        <section className={styles.mapSection} aria-label={t('pages.mapPrint.mapLabel')}>
          <div className={styles.mapGrid}>
            {groundCells.map((cell) => (
              <span key={cell.id} className={`${styles.mapCell} ${cell.textureSrc ? styles.mapCellTextured : ''}`} style={cell.textureSrc ? { backgroundImage: `url(${cell.textureSrc})` } : undefined} />
            ))}
            {elements.map((element) => (
              <span key={element.id} className={styles.mapElement} style={{
                left: `${(element.x / 34) * 100}%`,
                top: `${(element.y / 22) * 100}%`,
                width: `${100 / 34}%`,
                height: `${100 / 22}%`,
                backgroundImage: `url(${element.imageSrc})`,
              }} />
            ))}
            {lines.map((line) => (
              <span key={line.id} className={getLineClassName(line)} style={{
                left: `${(line.x / 34) * 100}%`,
                top: `${(line.y / 22) * 100}%`,
                width: line.orientation === 'horizontal' ? `${(line.width / 34) * 100}%` : undefined,
                height: line.orientation === 'vertical' ? `${(line.height / 22) * 100}%` : undefined,
              }}>
                <span className={styles.lineSegmentStroke} />
              </span>
            ))}
            {labels.map((label) => (
              <span key={label.id} className={styles.mapLabel} style={{
                left: `${(label.x / 34) * 100}%`,
                top: `${(label.y / 22) * 100}%`,
                width: `${100 / 34}%`,
                height: `${100 / 22}%`,
              }}>
                <span className={styles.mapLabelNumber}>{label.number}</span>
              </span>
            ))}
          </div>
        </section>

        {description ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('pages.mapPrint.sections.description')}</h2>
            <p className={styles.description}>{description}</p>
          </section>
        ) : null}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('pages.mapPrint.sections.legend')}</h2>
          {labels.length > 0 ? (
            <ol className={styles.legendList}>
              {labels.map((label) => (
                <li key={label.id} className={styles.legendItem}>
                  <span className={styles.legendNumber}>{label.number}</span>
                  <span>{label.name}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.emptyState}>{t('pages.mapPrint.emptyLegend')}</p>
          )}
        </section>
      </article>
    </main>
  )
}
