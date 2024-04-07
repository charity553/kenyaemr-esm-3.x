import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTableSkeleton,
  Layer,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  Tile,
  Pagination,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  Button,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { isDesktop, useLayoutType, usePagination } from '@openmrs/esm-framework';
import {
  EmptyDataIllustration,
  ErrorState,
  usePaginationInfo,
  launchPatientWorkspace,
  CardHeader,
} from '@openmrs/esm-patient-common-lib';
import { useBills } from '../claims.resource';
import InvoiceTable from '../invoice/invoice-table.component';
import styles from './bill-history.scss';

interface BillHistoryProps {
  patientUuid: string;
}

const BillHistory: React.FC<BillHistoryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { bills, isLoading, error } = useBills(patientUuid);
  const layout = useLayoutType();
  const [pageSize, setPageSize] = React.useState(10);
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';
  const { paginated, goTo, results, currentPage } = usePagination(bills, pageSize);
  const { pageSizes } = usePaginationInfo(pageSize, bills?.length, currentPage, results?.length);

  const headerData = [
    {
      header: t('visitTime', 'Visit time'),
      key: 'visitTime',
    },
    {
      header: t('identifier', 'Identifier'),
      key: 'identifier',
    },
    {
      header: t('billedItems', 'Billed Items'),
      key: 'billedItems',
    },
    {
      header: t('billTotal', 'Bill total'),
      key: 'billTotal',
    },
  ];

  const setBilledItems = (bill) =>
    bill.lineItems.reduce(
      (acc, item) => acc + (acc ? ' & ' : '') + (item.billableService?.split(':')[1] || item.item?.split(':')[1] || ''),
      '',
    );

  const rowData = results?.map((bill) => ({
    id: bill.uuid,
    uuid: bill.uuid,
    billTotal: bill.totalAmount,
    visitTime: bill.dateCreated,
    identifier: bill.identifier,
    billedItems: setBilledItems(bill),
  }));

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <DataTableSkeleton showHeader={false} showToolbar={false} zebra size={responsiveSize} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Layer>
          <ErrorState error={error} headerTitle={t('claimsList', 'Claims list')} />
        </Layer>
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <Layer className={styles.emptyStateContainer}>
        <Tile className={styles.tile}>
          <p className={styles.billingHeading} style={{ textAlign: 'left' }}>
            Claims History
          </p>
          <div className={styles.illo}>
            <EmptyDataIllustration />
          </div>
          <p className={styles.content}>There are no claims to display.</p>
          <Button
            onClick={() => launchPatientWorkspace('billing-form', { workspaceTitle: 'Billing Form' })}
            kind="ghost">
            {t('launchBillForm', 'Launch bill form')}
          </Button>
        </Tile>
      </Layer>
    );
  }

  return (
    <div>
      <CardHeader title={t('billingHistory', 'Billing History')}>
        <Button
          renderIcon={Add}
          onClick={() => launchPatientWorkspace('billing-form', { workspaceTitle: 'Billing Form' })}
          kind="ghost">
          {t('addBill', 'Add bill item(s)')}
        </Button>
      </CardHeader>
      <div className={styles.billHistoryContainer}>
        <DataTable isSortable rows={rowData} headers={headerData} size={responsiveSize} useZebraStyles>
          {({
            rows,
            headers,
            getExpandHeaderProps,
            getTableProps,
            getTableContainerProps,
            getHeaderProps,
            getRowProps,
          }) => (
            <TableContainer {...getTableContainerProps}>
              <Table className={styles.table} {...getTableProps()} aria-label="Claims list">
                <TableHead>
                  <TableRow>
                    <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                    {headers.map((header, i) => (
                      <TableHeader
                        key={i}
                        {...getHeaderProps({
                          header,
                        })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, i) => {
                    const currentBill = bills?.find((bill) => bill.uuid === row.id);

                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableExpandRow>
                        {row.isExpanded ? (
                          <TableExpandedRow className={styles.expandedRow} colSpan={headers.length + 1}>
                            <div className={styles.container} key={i}>
                              <InvoiceTable bill={currentBill} isSelectable={false} />
                            </div>
                          </TableExpandedRow>
                        ) : (
                          <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
        {paginated && (
          <Pagination
            forwardText={t('nextPage', 'Next page')}
            backwardText={t('previousPage', 'Previous page')}
            page={currentPage}
            pageSize={pageSize}
            pageSizes={pageSizes}
            totalItems={bills.length}
            className={styles.pagination}
            size={responsiveSize}
            onChange={({ page: newPage, pageSize }) => {
              if (newPage !== currentPage) {
                goTo(newPage);
              }
              setPageSize(pageSize);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BillHistory;
