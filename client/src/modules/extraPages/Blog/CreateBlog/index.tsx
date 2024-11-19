import React, { useEffect, useId, useState } from "react";
import AppRowContainer from "@crema/components/AppRowContainer";
import BlogSidebar from "./Sidebar";
import BlogContent from "./Content";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { postDataApi, putDataApi } from "@crema/hooks/APIHooks";
import { CreateNewBlog } from "./NewBlogTemplete";
import { useRouter } from "next/router";
import { StyledTitle } from "./index.styled";
import { Form } from "antd";
import type {
  BlogContentType,
  TagType,
} from "@crema/types/models/extrapages/Blog";
import type { FileType } from "@crema/types/models/extrapages/Blog";

type Props = {
  selectedBlog?: BlogContentType;
};

export const CreateBlog = ({ selectedBlog }: Props) => {
  const id = useId();
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileType[]>([]);
  const infoViewActionsContext = useInfoViewActionsContext();
  const router = useRouter();

  useEffect(() => {
    if (selectedBlog) {
      setSelectedTags(selectedBlog?.blogDetailContent?.tag);
      setUploadedFiles([
        { preview: selectedBlog?.blogDetailContent?.cardMedia },
      ]);
    }
  }, [selectedBlog]);
  return (
    <>
      <StyledTitle>
        {selectedBlog ? "Edit Blog" : "Create a new blog"}
      </StyledTitle>

      <Form
        initialValues={{
          title: selectedBlog?.blogDetailContent?.title || "",
          description: selectedBlog?.blogDetailContent?.description || "",
          content: selectedBlog?.blogDetailContent?.content || "",
          tag: selectedBlog?.blogDetailContent?.tag || [],
          cardMedia: selectedBlog?.blogDetailContent?.cardMedia || "",
          metatitle: selectedBlog?.blogDetailContent?.meta?.metatitle || "",
          metadesc: selectedBlog?.blogDetailContent?.meta?.metadesc || "",
          keywords: selectedBlog?.blogDetailContent?.meta?.keywords || "",
        }}
        layout="vertical"
        onFinish={(data) => {
          if (selectedBlog) {
            const newBlog = {
              ...selectedBlog,
              blogDetailContent: {
                ...selectedBlog.blogDetailContent,
                title: data.title,
                description: data.description,
                content: data.content,
                tag: selectedTags,
                cardMedia:
                  uploadedFiles[0]?.preview ||
                  selectedBlog.blogDetailContent.cardMedia,
                meta: {
                  keywords: data.keywords,
                  metadesc: data.metadesc,
                  metatitle: data.metatitle,
                },
                post: {
                  user: "/assets/images/avatar/A12.jpg",
                  userName: "John Deuo",
                  userPosition: "Co-founder",
                  description: selectedBlog.blogDetailContent.post.description,
                },
              },
            };
            putDataApi("/pages/blogs", infoViewActionsContext, {
              blog: newBlog,
            })
              .then(() => {
                router.push("/extra-pages/blog");
                infoViewActionsContext.showMessage(
                  "Blog updated successfully!"
                );
              })
              .catch((error) => {
                infoViewActionsContext.fetchError(error.message);
              });
          } else {
            postDataApi("/pages/blogs", infoViewActionsContext, {
              blog: CreateNewBlog({
                ...data,
                id,
                content: data.content,
                srcImg: uploadedFiles[0]?.preview,
                tag: selectedTags,
              }),
            })
              .then(() => {
                infoViewActionsContext.showMessage(
                  "Blog created successfully!"
                );
                router.push("/extra-pages/blog");
              })
              .catch((error) => {
                infoViewActionsContext.fetchError(error.message);
              });
          }
        }}
      >
        <AppRowContainer>
          <BlogContent
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
          />
          <BlogSidebar
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
          />
        </AppRowContainer>
      </Form>
    </>
  );
};

export default CreateBlog;
