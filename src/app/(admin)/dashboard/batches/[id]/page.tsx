import Students from "@/components/admin/dashboard/batches/Students/Students";

type Props = {
  params: { id: string };
};

const page = ({ params }: Props) => {
  const slug = params.id;

  return (
    <>
      <Students slug={slug} />
    </>
  );
};

export default page;
