import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCarts } from '../api/carts';
import { useCartOverridesStore, useCartsFilterStore } from '../store/cartUiStore';
import styles from './CartsListPage.module.scss';

export const CartsListPage = () => {
  const { page, limit, userIdFilter, setPage, setLimit, setUserIdFilter } = useCartsFilterStore();
  const cartOverrides = useCartOverridesStore((state) => state.overrides);

  const skip = (page - 1) * limit;
  const userId = userIdFilter.trim() ? Number(userIdFilter) || undefined : undefined;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['carts', { limit, skip, userId }],
    queryFn: () => fetchCarts({ limit, skip, userId }),
    keepPreviousData: true
  });

  const total = data?.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Корзины пользователей</h1>
      <div className={styles.controlsRow}>
        <div className={styles.controlGroup}>
          <span>Фильтр по userId:</span>
          <input
            className={styles.textInput}
            placeholder="любой"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
          />
        </div>
        <div className={styles.controlGroup}>
          <span>Элементов на страницу:</span>
          <select
            className={styles.select}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {isLoading && <div className={styles.status}>Загружаем корзины...</div>}

      {isError && (
        <div className={styles.status}>
          Произошла ошибка
          {' '}
          {(error as Error).message}
        </div>
      )}

      {!isLoading && !isError && data && (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>ID</th>
                <th className={styles.th}>userId</th>
                <th className={styles.th}>Кол-во товаров</th>
                <th className={styles.th}>Всего позиций</th>
                <th className={styles.th}>Сумма</th>
                <th className={styles.th} />
              </tr>
            </thead>
            <tbody>
              {data.carts.map((originalCart) => {
                const override = cartOverrides[originalCart.id];
                const cart = override ?? originalCart;

                return (
                  <tr key={cart.id} className={styles.row}>
                    <td className={styles.td}>
                      <span className={styles.badge}>
                        #
                        {cart.id}
                      </span>
                    </td>
                    <td className={styles.td}>
                      user
                      {' '}
                      {cart.userId}
                    </td>
                    <td className={styles.td}>{cart.totalProducts}</td>
                    <td className={styles.td}>{cart.totalQuantity}</td>
                    <td className={styles.td}>
                      $
                      {cart.total.toFixed(2)}
                    </td>
                    <td className={styles.td}>
                      <Link to={`/carts/${cart.id}`} className={styles.primaryLinkButton}>
                        Детали
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className={styles.pagination}>
            <div>
              Страница
              {' '}
              <strong>{page}</strong>
              {' '}
              из
              {' '}
              <strong>{totalPages}</strong>
            </div>
            <div className={styles.paginationControls}>
              <button
                type="button"
                className={styles.button}
                onClick={handlePrev}
                disabled={page === 1}
              >
                ← Назад
              </button>
              <button
                type="button"
                className={styles.button}
                onClick={handleNext}
                disabled={page >= totalPages || total === 0}
              >
                Вперёд →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

