import { useGetDataApi } from "@crema/hooks/APIHooks";
import AppLoader from "@crema/components/AppLoader";
import AppAnimate from "@crema/components/AppAnimate";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { isEmptyObject } from "@crema/helpers/ApiHelper";
import CreateBlog from "../CreateBlog";
import type {
  BlogContentType,
  BlogSidebarType,
} from "@crema/types/models/extrapages/Blog";

const BlogEditPage = () => {
  const { query } = useRouter();
  const [{ apiData, loading }, { setQueryParams }] = useGetDataApi<
    | {
        blogDetail: BlogContentType | undefined;
        blogSidebar: BlogSidebarType;
      }
    | undefined
  >("/pages/blogs/detail", undefined, { id: query.all?.[0] }, false);

  useEffect(() => {
    setQueryParams({ id: query.all?.[0] });
  }, [query.all?.[0]]);

  return loading ? (
    <AppLoader />
  ) : !isEmptyObject(apiData?.blogDetail) ? (
    <AppAnimate animation="transition.slideUpIn" delay={200}>
      <CreateBlog selectedBlog={apiData?.blogDetail} />
    </AppAnimate>
  ) : null;
};
export default BlogEditPage;
