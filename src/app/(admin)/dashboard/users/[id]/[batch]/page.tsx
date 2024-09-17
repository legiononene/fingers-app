import Batch from "@/components/admin/dashboard/users/user/batch/Batch";

type Props = {
  params: { batch: string };
};
const page = ({ params }: Props) => {
  const slug = params.batch;

  return (
    <>
      <Batch slug={slug} />
    </>
  );
};

export default page;
