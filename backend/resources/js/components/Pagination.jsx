import Icon from './Icon.jsx';
import SelectMenu from './SelectMenu.jsx';

function pageNumbers(page, totalPages) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const middle = Array.from({ length: 3 }, (_, index) =>
    Math.max(2, Math.min(page - 1, totalPages - 3)) + index);
  return [1, ...(middle[0] > 2 ? ['start-gap'] : []), ...middle,
    ...(middle[2] < totalPages - 1 ? ['end-gap'] : []), totalPages];
}

export default function Pagination({ total, page, pageSize, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const first = total ? (page - 1) * pageSize + 1 : 0;
  const last = Math.min(page * pageSize, total);

  return <nav className="pagination" aria-label="Paginação do inventário">
    <div className="pagination-summary"><span>Exibindo <strong>{first}–{last}</strong> de <strong>{total}</strong></span>
      <SelectMenu label="Itens por página" value={pageSize} onChange={onPageSizeChange}
        options={[5, 10, 20].map(value => ({ value, label: `${value} por página` }))} />
    </div>
    <div className="pagination-pages">
      <button className="page-button" type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)} aria-label="Página anterior"><Icon name="chevronLeft" size={16} /></button>
      {pageNumbers(page, totalPages).map(number => typeof number === 'number' ?
        <button className={`page-button ${page === number ? 'active' : ''}`} type="button" key={number} aria-label={`Página ${number}`} aria-current={page === number ? 'page' : undefined} onClick={() => onPageChange(number)}>{number}</button> :
        <span className="page-gap" key={number} aria-hidden="true">…</span>)}
      <button className="page-button" type="button" disabled={page === totalPages} onClick={() => onPageChange(page + 1)} aria-label="Próxima página"><Icon name="chevronRight" size={16} /></button>
    </div>
  </nav>;
}