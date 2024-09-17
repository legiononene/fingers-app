import User from "@/components/admin/dashboard/users/user/User";

type Props = {
  params: { id: string };
};

const page = ({ params }: Props) => {
  const slug = params.id;
  return (
    <>
      <User slug={slug} />
    </>
  );
};

export default page;
