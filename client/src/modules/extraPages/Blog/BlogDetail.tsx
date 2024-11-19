import { useGetDataApi } from "@crema/hooks/APIHooks";
import AppLoader from "@crema/components/AppLoader";
import { BlogDetail } from "@crema/modules/extraPages/Blog";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { isEmptyObject } from "@crema/helpers/ApiHelper";
import type {
  BlogDetailType,
  BlogSidebarType,
} from "@crema/types/models/extrapages/Blog";

const BlogDetailPage = () => {
  const { query } = useRouter();
  const [{ apiData, loading }, { setQueryParams }] = useGetDataApi<
    | {
        blogDetail: BlogDetailType;
        blogSidebar: BlogSidebarType;
      }
    | undefined
  >("/pages/blogs/detail", undefined, {}, false);

  useEffect(() => {
    if (query?.all?.[0]) setQueryParams({ id: query.all[0] });
    else setQueryParams({});
  }, [query.all]);

  return loading ? (
    <AppLoader />
  ) : !isEmptyObject(apiData?.blogDetail) ? (
    <BlogDetail
      blogSidebar={apiData!.blogSidebar}
      blogDetail={apiData!.blogDetail}
    />
  ) : null;
};
export default BlogDetailPage;
