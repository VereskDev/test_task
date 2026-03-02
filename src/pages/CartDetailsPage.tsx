import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Cart, CartProduct, fetchCart, updateCart } from '../api/carts';
import { useCartOverridesStore } from '../store/cartUiStore';
import styles from './CartDetailsPage.module.scss';

type EditableProduct = Pick<CartProduct, 'id' | 'title' | 'price'> & {
  quantity: number;
};

export const CartDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const numericId = Number(id);
  const cartOverride = useCartOverridesStore((state) =>
    Number.isFinite(numericId) ? state.overrides[numericId] : undefined
  );
  const setCartOverride = useCartOverridesStore((state) => state.setOverride);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['cart', numericId],
    queryFn: () => fetchCart(numericId),
    enabled: Number.isFinite(numericId)
  });

  const effectiveCart = cartOverride ?? data ?? null;

  const [products, setProducts] = useState<EditableProduct[]>([]);

  useEffect(() => {
    if (effectiveCart) {
      setProducts(
        effectiveCart.products.map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          quantity: p.quantity
        }))
      );
    }
  }, [effectiveCart]);

  const { mutate, isPending, isError: isUpdateError, error: updateError } = useMutation({
    mutationFn: (payload: EditableProduct[]) => {
      const itemsToKeep = payload.filter((p) => p.quantity > 0);
      return updateCart(numericId, {
        merge: false,
        products: itemsToKeep.map((p) => ({
          id: p.id,
          quantity: p.quantity
        }))
      });
    },
    onSuccess: (updatedCart: Cart) => {
      queryClient.setQueryData(['cart', numericId], updatedCart);
      queryClient.invalidateQueries({ queryKey: ['carts'] });

      setCartOverride(numericId, updatedCart);

      setProducts(
        updatedCart.products.map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          quantity: p.quantity
        }))
      );
    }
  });

  const activeProducts = useMemo(
    () => products.filter((p) => p.quantity > 0),
    [products]
  );

  const totals = useMemo(() => {
    const totalQuantity = activeProducts.reduce((sum, p) => sum + p.quantity, 0);
    const totalPrice = activeProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    return { totalQuantity, totalPrice };
  }, [activeProducts]);

  const handleQuantityChange = (productId: number, value: string) => {
    const num = Number(value);
    if (!Number.isFinite(num) || num < 0) return;
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity: num } : p))
    );
  };

  const handleRemove = (productId: number) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, quantity: 0 } : p)));
  };

  const handleSave = () => {
    mutate(products);
  };

  if (!Number.isFinite(numericId)) {
    return (
      <div className={styles.status}>Некорректный идентификатор корзины.</div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.headingRow}>
        <h1 className={styles.heading}>
          Корзина
          {' '}
          <span className={styles.badge}>
            #
            {numericId}
          </span>
        </h1>
        <Link to="/carts" onClick={() => navigate(-1)} className={styles.backLink}>
          ← Назад
        </Link>
      </div>

      {isLoading && <div className={styles.status}>Загружаем корзину...</div>}

      {isError && (
        <div className={styles.status}>
          Не удалось загрузить корзину:
          {' '}
          {(error as Error).message}
        </div>
      )}

      {!isLoading && !isError && effectiveCart && (
        <>
          <div className={styles.subHeading}>
            userId:
            {' '}
            <strong>{effectiveCart.userId}</strong>
            {' · '}
            товаров:
            {' '}
            <strong>{totals.totalQuantity}</strong>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Товар</th>
                <th className={styles.th}>Цена</th>
                <th className={styles.th}>Количество</th>
                <th className={styles.th}>Итого</th>
                <th className={styles.th} />
              </tr>
            </thead>
            <tbody>
              {activeProducts.map((p) => (
                <tr key={p.id} className={styles.row}>
                  <td className={styles.td}>{p.title}</td>
                  <td className={styles.td}>
                    $
                    {p.price.toFixed(2)}
                  </td>
                  <td className={styles.td}>
                    <div className={styles.quantityControl}>
                      <button
                        type="button"
                        className={styles.quantityButton}
                        onClick={() => handleQuantityChange(p.id, String(p.quantity - 1))}
                        disabled={isPending || p.quantity <= 0}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={0}
                        className={styles.quantityInput}
                        value={p.quantity}
                        onChange={(e) => handleQuantityChange(p.id, e.target.value)}
                      />
                      <button
                        type="button"
                        className={styles.quantityButton}
                        onClick={() => handleQuantityChange(p.id, String(p.quantity + 1))}
                        disabled={isPending}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className={styles.td}>
                    $
                    {(p.price * p.quantity).toFixed(2)}
                  </td>
                  <td className={styles.td}>
                    <button
                      type="button"
                      className={styles.dangerButton}
                      onClick={() => handleRemove(p.id)}
                      disabled={isPending}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.footerRow}>
            <div className={styles.totals}>
              <div>
                Итого по корзине:
                {' '}
                <strong>
                  $
                  {totals.totalPrice.toFixed(2)}
                </strong>
              </div>
              <span>
                Позиции:
                {' '}
                {activeProducts.length}
                {' · '}
                Товаров всего:
                {' '}
                {totals.totalQuantity}
              </span>
            </div>
            <div>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleSave}
                disabled={isPending}
              >
                {isPending ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </div>

          {isUpdateError && (
            <div className={styles.status}>
              Ошибка при сохранении корзины:
              {' '}
              {(updateError as Error).message}
            </div>
          )}
        </>
      )}
    </div>
  );
};

