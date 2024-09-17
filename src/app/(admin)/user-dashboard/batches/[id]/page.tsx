import Batch from "@/components/admin/userDashboard/batches/batch/Batch";
type Props = {
  params: { id: string };
};
const page = ({ params }: Props) => {
  const slug = params.id;

  return (
    <>
      <Batch slug={slug} />
    </>
  );
};

export default page;
