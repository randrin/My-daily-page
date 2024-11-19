import { FilterUserType } from '@crema/types/models/dashboards/UserType';
import React from 'react'

type Props = {
    filterData: FilterUserType;
    setFilterData: React.Dispatch<React.SetStateAction<FilterUserType>>;
  };

const FilterUsersItem = ({ filterData, setFilterData }: Props) => {
  return (
    <div>FilterUsersItem</div>
  )
}

export default FilterUsersItem