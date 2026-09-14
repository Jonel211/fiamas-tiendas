// src/pages/StoresPage.jsx
import StoresHeader from '../components/modules/Stores/StoresHeader';
import StoresFilters from '../components/modules/Stores/StoresFilters';
import StoresTable from '../components/modules/Stores/StoresTable';
import StoresPagination from '../components/modules/Stores/StoresPagination';

const StoresPage = () => {
  return (
    <div>
      <StoresHeader />
      <StoresFilters />
      <StoresTable />
      <StoresPagination currentPage={1} totalPages={5} onPageChange={(page) => console.log(page)} />
    </div>
  );
};
export default StoresPage;