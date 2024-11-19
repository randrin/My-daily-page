import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import dayjs from "dayjs";
import { AiOutlineDelete } from "react-icons/ai";
import { BiCloudDownload } from "react-icons/bi";
import AppIconButton from "@crema/components/AppIconButton";
import {
  StyledScrumBoardAttachmenTitle,
  StyledScrumBoardAttachment,
  StyledScrumBoardAttachmentItems,
  StyledScrumBoardAttachmentCard,
  StyledScrumBoardAttachmentImg,
  StyledScrumBoardAttachmentAction,
  StyledScrumBoardAttachmentContent,
  StyledScrumBoardAttachmentFileName,
  StyledScrumBoardAttachmentFileTime,
} from "./index.styled";
import { AttachmentObjType } from "@crema/types/models/apps/ScrumbBoard";

type CardAttachmentsProps = {
  attachments: AttachmentObjType[];
  onDeleteAttachment: (id: number) => void;
};

const CardAttachments: React.FC<CardAttachmentsProps> = ({
  attachments,
  onDeleteAttachment,
}) => {
  return (
    <>
      {attachments && attachments.length > 0 ? (
        <>
          <StyledScrumBoardAttachmenTitle>
            <IntlMessages id="common.attachments" />
          </StyledScrumBoardAttachmenTitle>

          {attachments ? (
            <StyledScrumBoardAttachment>
              {attachments.map((attachment) => {
                const { file } = attachment;
                return (
                  <StyledScrumBoardAttachmentItems key={attachment.id}>
                    <StyledScrumBoardAttachmentCard>
                      <StyledScrumBoardAttachmentImg>
                        <img src={attachment.preview} alt="attachment" />

                        <StyledScrumBoardAttachmentAction className="scrum-board-attachment-items-action">
                          <AppIconButton icon={<BiCloudDownload />} />
                          <AppIconButton
                            icon={<AiOutlineDelete />}
                            onClick={() => onDeleteAttachment(attachment.id)}
                          />
                        </StyledScrumBoardAttachmentAction>
                      </StyledScrumBoardAttachmentImg>

                      <StyledScrumBoardAttachmentContent>
                        <StyledScrumBoardAttachmentFileName className="text-truncate">
                          {file.name}
                        </StyledScrumBoardAttachmentFileName>
                        <StyledScrumBoardAttachmentFileTime>
                          <span>
                            {
                              dayjs(file.lastModified)
                                .format("MMM DD")
                                .split(",")[0]
                            }
                          </span>
                          <span>
                            <IntlMessages id="common.at" />
                          </span>
                          <span>{dayjs(file.lastModified).format("LT")}</span>
                        </StyledScrumBoardAttachmentFileTime>
                      </StyledScrumBoardAttachmentContent>
                    </StyledScrumBoardAttachmentCard>
                  </StyledScrumBoardAttachmentItems>
                );
              })}
            </StyledScrumBoardAttachment>
          ) : null}
        </>
      ) : null}
    </>
  );
};

export default CardAttachments;
