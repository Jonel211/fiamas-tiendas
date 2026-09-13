// src/pages/VendorsPage.jsx
import VendorsHeader from '../components/modules/Vendors/VendorsHeader';
import VendorsFilters from '../components/modules/Vendors/VendorsFilters';
import VendorsTable from '../components/modules/Vendors/VendorsTable';
import VendorsPagination from '../components/modules/Vendors/VendorsPagination';

const VendorsPage = () => {
  return (
    <div>
      <VendorsHeader />
      <VendorsFilters />
      <VendorsTable />
      <VendorsPagination currentPage={1} totalPages={3} onPageChange={(page) => console.log(page)} />
    </div>
  );
};
export default VendorsPage;