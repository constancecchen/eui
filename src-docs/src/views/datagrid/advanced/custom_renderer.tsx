import React, {
  useEffect,
  useCallback,
  useState,
  useContext,
  createContext,
} from 'react';
import { css } from '@emotion/react';
import { faker } from '@faker-js/faker';

import {
  EuiDataGrid,
  EuiDataGridProps,
  EuiDataGridColumnCellActionProps,
  EuiDataGridCellProps,
  EuiScreenReaderOnly,
  EuiButtonIcon,
  EuiButton,
  EuiMarkdownEditor,
  EuiCommentList,
  EuiConfirmModal,
  EuiFlexGroup,
  EuiSpacer,
  useEuiTheme,
  logicalCSS,
  EuiDataGridPaginationProps,
  EuiDataGridSorting,
  EuiDataGridColumnSortingConfig,
} from '../../../../../src';

const raw_data: Array<{ [key: string]: string }> = [];
for (let i = 1; i < 100; i++) {
  raw_data.push({
    name: `${faker.person.lastName()}, ${faker.person.firstName()}`,
    email: faker.internet.email(),
    location: `${faker.location.city()}, ${faker.location.country()}`,
    date: `${faker.date.past()}`,
    amount: faker.commerce.price({ min: 1, max: 1000, dec: 2, symbol: '$' }),
  });
}

const columns = [
  {
    id: 'name',
    displayAsText: 'Name',
    cellActions: [
      ({ Component }: EuiDataGridColumnCellActionProps) => (
        <Component
          onClick={() => alert('action')}
          iconType="faceHappy"
          aria-label="Some action"
        >
          Some action
        </Component>
      ),
    ],
  },
  {
    id: 'email',
    displayAsText: 'Email address',
    initialWidth: 130,
  },
  {
    id: 'location',
    displayAsText: 'Location',
  },
  {
    id: 'date',
    displayAsText: 'Date',
  },
  {
    id: 'amount',
    displayAsText: 'Amount',
  },
];

type NotesMap = Record<number, { notes?: string[]; isAddingNote?: boolean }>;
const NotesContext = createContext<{
  notesMap: NotesMap;
  setNotesMap: Function;
}>({
  notesMap: {},
  setNotesMap: () => {},
});

const AddNoteAction: EuiDataGridCellProps['renderCellValue'] = ({
  rowIndex,
}) => {
  const { setNotesMap } = useContext(NotesContext);

  return (
    <EuiButtonIcon
      iconType="documentEdit"
      aria-label="Add note to row"
      title="Add note to row"
      onClick={() =>
        setNotesMap((notesMap: NotesMap) => {
          const row = notesMap[rowIndex];
          if (row?.isAddingNote) return notesMap; // If we're already adding a note, no need to update

          return {
            ...notesMap,
            [rowIndex]: { ...row, isAddingNote: true },
          };
        })
      }
    />
  );
};

const leadingControlColumns: EuiDataGridProps['leadingControlColumns'] = [
  {
    id: 'selection',
    width: 40,
    headerCellRender: () => (
      <EuiScreenReaderOnly>
        <span>Add note</span>
      </EuiScreenReaderOnly>
    ),
    rowCellRender: AddNoteAction,
  },
];

const Notes: EuiDataGridCellProps['renderCellValue'] = ({
  rowIndex,
  setCellProps,
}) => {
  const { notesMap, setNotesMap } = useContext(NotesContext);
  const row = notesMap[rowIndex];

  // When rendering this custom cell, we'll want to override
  // the automatic width/heights calculated by EuiDataGrid
  useEffect(() => {
    setCellProps({ style: { width: '100%', height: 'auto' } });
  }, [row, setCellProps]);

  const [editingValue, setEditingValue] = useState('');
  const [deleteConfirmation, showDeleteConfirmation] = useState<false | number>(
    false
  );

  if (row?.isAddingNote) {
    return (
      <>
        <EuiMarkdownEditor
          aria-label="Add note"
          placeholder="Add note"
          value={editingValue}
          onChange={setEditingValue}
          initialViewMode="editing"
          markdownFormatProps={{ textSize: 's' }}
        />
        <EuiSpacer size="s" />
        <EuiFlexGroup
          gutterSize="s"
          justifyContent="spaceBetween"
          responsive={false}
        >
          <EuiButton
            onClick={() =>
              setNotesMap((notesMap: NotesMap) => ({
                ...notesMap,
                [rowIndex]: {
                  ...row,
                  isAddingNote: false,
                },
              }))
            }
          >
            Cancel
          </EuiButton>
          <EuiButton
            fill
            type="submit"
            onClick={() =>
              setNotesMap((notesMap: NotesMap) => ({
                ...notesMap,
                [rowIndex]: {
                  notes: [...(row?.notes || []), editingValue],
                  isAddingNote: false,
                },
              }))
            }
            isDisabled={!editingValue}
          >
            Save
          </EuiButton>
        </EuiFlexGroup>
      </>
    );
  } else if (row?.notes?.length) {
    const notes = row.notes.map((note, index) => ({
      username: 'todo',
      event: 'added a note',
      children: <p>{note}</p>,
      actions: [
        <EuiButtonIcon
          color="danger"
          iconType="trash"
          aria-label="Delete note"
          title="Delete note"
          onClick={() => showDeleteConfirmation(index)}
        />,
      ],
    }));
    return (
      <>
        <EuiCommentList comments={notes} />

        {deleteConfirmation !== false && (
          <EuiConfirmModal
            title="Delete note?"
            onCancel={() => showDeleteConfirmation(false)}
            onConfirm={() => {
              setNotesMap((notesMap: NotesMap) => {
                return {
                  ...notesMap,
                  [rowIndex]: {
                    notes: row.notes?.toSpliced(deleteConfirmation, 1),
                    isAddingNote: false,
                  },
                };
              });
              showDeleteConfirmation(false);
            }}
            // This is bad copy
            cancelButtonText="No, keep note"
            confirmButtonText="Yes, delete note"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          />
        )}
      </>
    );
  }
};

// The custom add notes row is actually a trailing control column cell with
// a hidden header. This is important for accessibility and markup reasons
// @see https://fuschia-stretch.glitch.me/ for more
const trailingControlColumns: EuiDataGridProps['trailingControlColumns'] = [
  {
    id: 'row-notes',

    // The header cell should be visually hidden, but available to screen readers
    width: 0,
    headerCellRender: () => <>Row notes</>,
    headerCellProps: { className: 'euiScreenReaderOnly' },

    // The footer cell can be hidden to both visual & SR users, as it does not contain meaningful information
    footerCellProps: { style: { display: 'none' } },

    rowCellRender: Notes,
  },
];

// Custom grid body renderer
const RenderCustomGridBody: EuiDataGridProps['renderCustomGridBody'] = ({
  Cell,
  visibleColumns,
  visibleRowData,
}) => {
  // Ensure we're displaying correctly-paginated rows
  const visibleRows = raw_data.slice(
    visibleRowData.startRow,
    visibleRowData.endRow
  );

  // Add styling needed for custom grid body rows
  const { euiTheme } = useEuiTheme();
  const styles = {
    row: css`
      ${logicalCSS('width', 'fit-content')};
      ${logicalCSS('border-bottom', euiTheme.border.thin)};
      background-color: ${euiTheme.colors.emptyShade};
    `,
    rowCellsWrapper: css`
      display: flex;
    `,
  };

  const { notesMap } = useContext(NotesContext);

  return (
    <>
      {visibleRows.map((row, rowIndex) => (
        <div role="row" css={styles.row} key={rowIndex}>
          <div css={styles.rowCellsWrapper}>
            {visibleColumns.map((column, colIndex) => {
              // Skip the row notes cell - we'll render it manually outside of the flex wrapper
              if (column.id !== 'row-notes') {
                return (
                  <Cell
                    colIndex={colIndex}
                    visibleRowIndex={rowIndex}
                    key={`${rowIndex},${colIndex}`}
                  />
                );
              }
            })}
          </div>
          {(notesMap[rowIndex]?.isAddingNote ||
            (notesMap[rowIndex]?.notes?.length || 0) > 0) && (
            <Cell
              colIndex={visibleColumns.length - 1} // If the row is being shown, it should always be the last index
              visibleRowIndex={rowIndex}
            />
          )}
        </div>
      ))}
    </>
  );
};

export default () => {
  const [notesMap, setNotesMap] = useState<NotesMap>({
    0: { notes: ['Example note 1', 'Example note 2'] },
  });

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState(() =>
    columns.map(({ id }) => id)
  );

  // Pagination
  const [pagination, setPagination] = useState({ pageIndex: 0 });
  const onChangePage = useCallback<EuiDataGridPaginationProps['onChangePage']>(
    (pageIndex) => {
      setPagination((pagination) => ({ ...pagination, pageIndex }));
    },
    []
  );
  const onChangePageSize = useCallback<
    EuiDataGridPaginationProps['onChangeItemsPerPage']
  >((pageSize) => {
    setPagination((pagination) => ({ ...pagination, pageSize }));
  }, []);

  // Sorting
  const [sortingColumns, setSortingColumns] = useState<
    EuiDataGridColumnSortingConfig[]
  >([]);
  const onSort = useCallback<EuiDataGridSorting['onSort']>((sortingColumns) => {
    setSortingColumns(sortingColumns);
  }, []);

  return (
    <NotesContext.Provider value={{ notesMap, setNotesMap }}>
      <EuiDataGrid
        aria-label="Data grid custom body renderer demo"
        columns={columns}
        leadingControlColumns={leadingControlColumns}
        trailingControlColumns={trailingControlColumns}
        columnVisibility={{ visibleColumns, setVisibleColumns }}
        sorting={{ columns: sortingColumns, onSort }}
        inMemory={{ level: 'sorting' }}
        pagination={{
          ...pagination,
          onChangePage: onChangePage,
          onChangeItemsPerPage: onChangePageSize,
        }}
        rowCount={raw_data.length}
        renderCellValue={({ rowIndex, columnId }) =>
          raw_data[rowIndex][columnId]
        }
        renderCustomGridBody={RenderCustomGridBody}
        gridStyle={{ border: 'none', header: 'underline' }}
      />
    </NotesContext.Provider>
  );
};
