import type { Metadata } from "next";
import { MessagesInbox } from "@/components/admin/messages-inbox";
import { PageHeader } from "@/components/admin/page-header";
import { adminMessages } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Messages" };

export default async function Page() {
  const messages = await adminMessages();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Messages" description="Submissions from the contact form. Opening a message marks it as read." />
      <MessagesInbox messages={messages} />
    </div>
  );
}
