import { CloudUploadOutlined } from "@ant-design/icons";
import jwtAxios from "@crema/services/auth/jwt-auth";
import { Avatar, Badge, Col, message } from "antd";
import Resizer from "react-image-file-resizer";
import { useIntl } from "react-intl";
import { TAM_EXPENSE_UPLOAD_SINGLE_URL } from "utils/end-points.utils";

const MultipleFileUpload = ({ items, setItems }) => {
  // Desctructing
  const { messages } = useIntl();

  // Functions
  const handleOnChange = async (e: any) => {
    // Resize
    const files = e.target.files;
    console.log(files, items.attachments);

    const allUploadedFiles = items?.attachments || [];
    if (files) {
      for (let i = 0; i < files.length; i++) {
        Resizer.imageFileResizer(
          files[i],
          720,
          720,
          "JPEG",
          100,
          0,
          async (uri) => {
            const file = new FormData();
            file.append("file", files[i]);
            await jwtAxios
              .post(TAM_EXPENSE_UPLOAD_SINGLE_URL, file, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              })
              .then((res) => {
                console.log(res);

                allUploadedFiles.push(res.data);
                setItems({ ...items, attachments: allUploadedFiles });
              })
              .catch((error) => {
                console.log(
                  "MultipleFileUpload -> handleOnChange Error: ",
                  error
                );
                message.error(error.response.data.message);
              });
          },
          "base64"
        );
      }
    }
    // Send back to server to upload to cloudinary
    // Set url to images[] in the parent component - ProductCreate
  };

  const handleImageRemove = async (public_id) => {
    await jwtAxios
      .post(public_id)
      .then((res) => {
        const { images } = items;
        let filteredImages = images.filter((item) => {
          return item.public_id !== public_id;
        });
        setItems({ ...items, images: filteredImages });
      })
      .catch((error) => {
        console.log("MultipleFileUpload -> handleImageRemove Error: ", error);
        message.error(error.response.data.message);
      });
  };

  // Render
  return (
    <Col className="tt-expenses-without-padding col d-flex">
      {items?.attachments?.map((image) => (
        <Badge
          count="X"
          key={image.public_id}
          //onClick={() => handleImageRemove(image.public_id)}
          className="tt-expenses-cursor-pointer tt-expenses-btn-remove-image mr-10"
        >
          <Avatar
            key={image.public_id}
            src={image.url}
            size={100}
            onClick={() => handleImageRemove(image.public_id)}
            shape="square"
            className="m-3"
          />
        </Badge>
      ))}
      <label className="tt-expenses-btn-upload">
        <CloudUploadOutlined
          size={30}
          className="tt-expenses-btn-upload-icon"
        />
        {messages["common.upload.file"] as string}
        <input
          className="ant-upload-drag-icon"
          type="file"
          multiple
          hidden
          accept="image/*"
          onChange={handleOnChange}
        />
      </label>
    </Col>
  );
};

export default MultipleFileUpload;
