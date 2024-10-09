import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Location } from '@carbon/react/icons';
import { useSession, formatDate } from '@openmrs/esm-framework';
import styles from './morgue-header.scss';
import MorgueIllustration from './morgue-illustration.component';

interface MorgueHeaderProps {
  title: string;
}

export const MorgueHeader: React.FC<MorgueHeaderProps> = ({ title }) => {
  const { t } = useTranslation();
  const userSession = useSession();
  const userLocation = userSession?.sessionLocation?.display;

  return (
    <div className={styles.header}>
      <div className={styles['left-justified-items']}>
        <MorgueIllustration />
        <div className={styles['page-labels']}>
          <p>{t('morgue', 'Morgue Management')}</p>
          <p className={styles['page-name']}>{title}</p>
        </div>
      </div>
      <div className={styles.metrics}>
        <div className={styles.wrapMetrics}>
          <span className={styles.metricLabel}>{t('awaiting', 'Awaiting')}</span>
          <span className={styles.metricValue}>0</span>
        </div>
        <div className={styles.wrapMetrics}>
          <span className={styles.metricLabel}>{t('admittedOnes', 'Admitted')}</span>
          <span className={styles.metricValue}>0</span>
        </div>
        <div className={styles.wrapMetrics}>
          <span className={styles.metricLabel}>{t('discharges', 'Discharges')}</span>
          <span className={styles.metricValue}>0</span>
        </div>
        <div className={styles.wrapMetrics}>
          <span className={styles.metricLabel}>{t('amountCollected', 'Amount(s)')}</span>
          <span className={styles.metricValue}>0</span>
        </div>
        <div className={styles.wrapMetrics}>
          <div className={styles.metricLocationDate}>
            <span className={styles.location}>
              <Location size={16} /> {userLocation}
            </span>
            <span className={styles.date}>
              <Calendar size={16} /> {formatDate(new Date(), { mode: 'standard' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};