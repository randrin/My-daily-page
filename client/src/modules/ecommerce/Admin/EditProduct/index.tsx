import { useGetDataApi } from "@crema/hooks/APIHooks";
import AppLoader from "@crema/components/AppLoader";
import AppAnimate from "@crema/components/AppAnimate";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { isEmptyObject } from "@crema/helpers/ApiHelper";
import AddEditProduct from "../AddEditProduct";
import { ProductDataType } from "@crema/types/models/ecommerce/EcommerceApp";

const ProductEditPage = () => {
  const { query } = useRouter();
  const [{ apiData: currentProduct, loading }, { setQueryParams }] =
    useGetDataApi<ProductDataType>("/api/ecommerce/get", undefined, {}, false);

  useEffect(() => {
    setQueryParams({ id: query.all?.[0] });
  }, [query.all?.[0]]);

  return loading || isEmptyObject(currentProduct) ? (
    <AppLoader />
  ) : (
    <AppAnimate animation="transition.slideUpIn" delay={200}>
      <AddEditProduct selectedProd={currentProduct} />
    </AppAnimate>
  );
};
export default ProductEditPage;
