
import { cn } from "@/lib/utils";
import Image from 'next/image';

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="https://i.imgur.com/s6nDEmG.png"
        alt="BranchWise Logo"
        width={40}
        height={40}
        data-ai-hint="medical council logo"
      />
    </div>
  );
};

export default Logo;
