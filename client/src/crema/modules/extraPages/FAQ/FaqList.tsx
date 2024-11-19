import React from "react";
import { Collapse } from "antd";
import { StyledFaqList } from "./index.styled";
import { GeneralFaq } from "@crema/mockapi/fakedb/extraPages";

const { Panel } = Collapse;

function callback(key: any) {
  console.log(key);
}

type FaqListProps = {
  faqList: GeneralFaq[];
};

const FaqList: React.FC<FaqListProps> = ({ faqList }) => {
  console.log(faqList[0].id);

  return (
    <StyledFaqList>
      <Collapse defaultActiveKey={faqList[0].id} onChange={callback}>
        {faqList.map((item) => {
          return (
            <Panel header={item.ques} key={item.id}>
              <p>{item.ans}</p>
            </Panel>
          );
        })}
      </Collapse>
    </StyledFaqList>
  );
};

export default FaqList;
