import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import React from "react";
interface Props {
  count: number;
  title: string;
  icon: React.ReactNode;
  subtitle: string;
  link?: string;
}
const CardAnimation = ({ count, title, icon, subtitle, link }: Props) => {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="cursor-pointer"
      onClick={() => {
        if (link) {
          router.push(link);
        }
      }}
    >
      {/* <Card className="w-full shadow-md rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{count}</div>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </CardContent>
      </Card> */}

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardDescription>{title}</CardDescription>
            {icon}
          </div>
          <CardTitle className="text-3xl">{count}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </CardHeader>
      </Card>
    </motion.div>
  );
};

export default CardAnimation;
