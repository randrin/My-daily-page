import React from "react";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
  TwitterShareButton,
} from "react-share";
import { Rate } from "antd";
import {
  StyledProductDetailHeader,
  StyledProductDetailHeaderContent,
  StyledProductDetailHeaderInfo,
  StyledProfileMbText,
  StyledProfileReviewText,
  StyledProductDetailSocial,
} from "./index.styled";
import type { ProductDataType } from "@crema/types/models/ecommerce/EcommerceApp";

type Props = {
  product: ProductDataType;
};

const Header = ({ product }: Props) => {
  const shareUrl = "http://crema-react.firebaseapp.com/";

  return (
    <StyledProductDetailHeader>
      <StyledProductDetailHeaderInfo>
        <h3>{product.title}</h3>
        <StyledProductDetailHeaderContent>
          <Rate defaultValue={product.rating} disabled />
          <StyledProfileReviewText>
            {product.reviews || 0 + " reviews"}
          </StyledProfileReviewText>

          <span>
            SKU :{" "}
            <StyledProfileMbText> {product.SKU || "MB023"}</StyledProfileMbText>
          </span>
        </StyledProductDetailHeaderContent>
      </StyledProductDetailHeaderInfo>

      <StyledProductDetailSocial>
        <LinkedinShareButton url={shareUrl} style={{ marginRight: 10 }}>
          <LinkedinIcon size={32} round={true} />
        </LinkedinShareButton>
        <FacebookShareButton url={shareUrl} style={{ marginRight: 10 }}>
          <FacebookIcon size={32} round={true} />
        </FacebookShareButton>
        <TwitterShareButton url={shareUrl}>
          <TwitterIcon size={32} round={true} />
        </TwitterShareButton>
      </StyledProductDetailSocial>
    </StyledProductDetailHeader>
  );
};

export default Header;
