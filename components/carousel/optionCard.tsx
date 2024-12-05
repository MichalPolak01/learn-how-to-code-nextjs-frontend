"use client"

import { Card } from "@nextui-org/card";
import { Link } from "@nextui-org/link";
import { LucideIcon } from "lucide-react";


interface OptionCardProps {
    color: string;
    icon: LucideIcon;
    text: string;
    href: string;
}

export default function OptionCard({ color, icon: Icon, text, href }: OptionCardProps) {
  return (
    <Card className="w-[11rem] h-[6rem] hover:scale-110">
      <Link className="p-5 text-default-900 flex flex-col h-full cursor-pointer hover:bg-default-100" href={href}>
        <Icon className={`w-full h-full text-${color}`} />
        <h3 className={`text-sm text-center text-${color} font-semibold`}>{text}</h3>
      </Link>
    </Card>
  );
}
