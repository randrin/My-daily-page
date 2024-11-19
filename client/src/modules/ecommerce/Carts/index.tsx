import React from "react";
import { useRouter } from "next/router";
import { CartTable, OrderSummary } from "@crema/modules/ecommerce/Carts";
import AppCard from "@crema/components/AppCard";
import IntlMessages from "@crema/helpers/IntlMessages";
import AppRowContainer from "@crema/components/AppRowContainer";
import { Button, Col } from "antd";
import AppAnimate from "@crema/components/AppAnimate";
import AppPageMeta from "@crema/components/AppPageMeta";
import QueueAnim from "rc-queue-anim";
import { StyledCartsFooter } from "./index.styled";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import type { CartItemsType } from "@crema/types/models/ecommerce/EcommerceApp";
import { postDataApi, putDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";

const Carts = () => {
  const router = useRouter();
  const infoViewActionsContext = useInfoViewActionsContext();

  const [{ apiData, loading }, { setData: setTableData }] = useGetDataApi<
    CartItemsType[]
  >("/api/cart/get", [], {});

  const onRemoveItem = (product: CartItemsType) => {
    postDataApi<CartItemsType[]>("/api/cart/remove", infoViewActionsContext, {
      product,
    })
      .then((data) => {
        setTableData(data);
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const onDecrement = (product: CartItemsType) => {
    if (product.count > 1) {
      putDataApi<CartItemsType[]>("/api/cart/update", infoViewActionsContext, {
        product: { ...product, count: product.count - 1 },
      })
        .then((data) => {
          setTableData(data);
        })
        .catch((error) => {
          infoViewActionsContext.fetchError(error.message);
        });
    } else {
      postDataApi<CartItemsType[]>("/api/cart/remove", infoViewActionsContext, {
        product,
      })
        .then((data) => {
          setTableData(data);
        })
        .catch((error) => {
          infoViewActionsContext.fetchError(error.message);
        });
    }
  };
  const onIncrement = (product: CartItemsType) => {
    putDataApi<CartItemsType[]>("/api/cart/update", infoViewActionsContext, {
      product: { ...product, count: product.count + 1 },
    })
      .then((data) => {
        setTableData(data);
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  return (
    <>
      <AppPageMeta title="Carts" />
      <QueueAnim style={{ zIndex: 3 }} type="scale">
        <h2 className="page-title" key="title">
          <IntlMessages id="sidebar.ecommerce.cart" />
        </h2>
      </QueueAnim>
      <AppRowContainer>
        <Col xs={24} lg={16}>
          <AppAnimate animation="transition.slideLeftIn" delay={200}>
            <AppCard
              key="a"
              className="no-card-space-ltr-rtl"
              actions={[
                <StyledCartsFooter key={1}>
                  <Button
                    type="primary"
                    onClick={() => {
                      router.push("/ecommerce/products");
                    }}
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    className="btn-secondary"
                    onClick={() => {
                      router.push("/ecommerce/checkout");
                    }}
                  >
                    Checkout
                  </Button>
                </StyledCartsFooter>,
              ]}
            >
              <CartTable
                cartItems={apiData}
                loading={loading}
                onRemoveItem={onRemoveItem}
                onIncrement={onRemoveItem}
                onDecrement={onDecrement}
              />
            </AppCard>
          </AppAnimate>
        </Col>
        <Col xs={24} lg={8}>
          <OrderSummary cartItems={apiData} key="b" />{" "}
        </Col>
      </AppRowContainer>
    </>
  );
};

export default Carts;
