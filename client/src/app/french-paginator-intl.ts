import { MatPaginatorIntl } from '@angular/material/paginator';

export class FrenchPaginatorIntl extends MatPaginatorIntl {
    itemsPerPageLabel = 'Éléments par page:';
    nextPageLabel = 'Page suivante';
    previousPageLabel = 'Page précédente';
    firstPageLabel = 'Première page';
    lastPageLabel = 'Dernière page';

    getRangeLabel = (page: number, pageSize: number, length: number): string => {
        if (length === 0 || pageSize === 0) {
            return `0 sur ${length}`;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
        return `${startIndex + 1} - ${endIndex} sur ${length}`;
    };
}
