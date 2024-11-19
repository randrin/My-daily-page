import { useGetDataApi } from "@crema/hooks/APIHooks";
import AppLoader from "@crema/components/AppLoader";
import { BlogContent } from "@crema/modules/extraPages/Blog";
import { isEmptyObject } from "@crema/helpers/ApiHelper";
import AppAnimate from "@crema/components/AppAnimate";
import { BlogType } from "@crema/types/models/extrapages/Blog";

const Blogs = () => {
  const [{ apiData, loading }] = useGetDataApi<BlogType>("/pages/blogs");

  return loading ? (
    <AppLoader />
  ) : !isEmptyObject(apiData.blogSidebar) ? (
    <AppAnimate animation="transition.slideUpIn" delay={200}>
      <BlogContent
        blogSidebar={apiData.blogSidebar}
        blogContent={apiData.blogContent}
      />
    </AppAnimate>
  ) : null;
};
export default Blogs;
