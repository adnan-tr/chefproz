import ServiceAdmin from '@/components/admin/ServiceAdmin';
import { Helmet } from 'react-helmet-async';

export default function ServicesPage() {
  return (
    <>
      <Helmet>
        <title>Services Management | Hublinq Management Portal</title>
      </Helmet>
      <ServiceAdmin />
    </>
  );
}