import Logout from "@/components/default/logout/Logout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Logout />
      {children}
    </>
  );
}
