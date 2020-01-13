import {DataSource} from '@angular/cdk/collections';
import {map} from 'rxjs/operators';
import {merge, Observable, of as observableOf} from 'rxjs';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';

export interface ViewTeamsItem {
  id: string;
  name: string;
}

/**
 * Data source for the ViewTeams view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class ViewTeamsDataSource extends DataSource<ViewTeamsItem> {
  data: ViewTeamsItem[] = [];

  constructor(private paginator: MatPaginator, private sort: MatSort) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<ViewTeamsItem[]> {
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      observableOf(this.data),
      this.paginator != null ? this.paginator.page : [],
      this.sort != null ? this.sort.sortChange : []
    ];

    // Set the paginator's length
    if (this.paginator != null) {
      this.paginator.length = this.data.length;
    }

    return merge(...dataMutations).pipe(map(() => {
      return this.getPagedData(this.getSortedData([...this.data]));
    }));
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {
  }

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: ViewTeamsItem[]) {
    const startIndex = this.paginator ? this.paginator.pageIndex * this.paginator.pageSize : 0;
    return data.splice(startIndex, this.paginator != null ? this.paginator.pageSize : 100);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: ViewTeamsItem[]) {
    if (data == null) {
      return [];
    }

    if (this.sort == null || !this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'id':
          return compare(a.id, b.id, isAsc);
        case 'name':
          return compare(a.name, b.name, isAsc);
        default:
          return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
