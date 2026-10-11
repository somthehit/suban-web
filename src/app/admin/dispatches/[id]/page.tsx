"use client";

import React from "react";
import { useParams } from "next/navigation";
import DispatchEditor from "@/components/admin/dispatch-editor/DispatchEditor";

export default function EditDispatchPage() {
  const params = useParams();
  const id = params?.id as string;

  return <DispatchEditor initialPostId={id} />;
}
